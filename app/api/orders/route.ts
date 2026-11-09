import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { kv } from '@vercel/kv';
import { sendOrderEmail } from '@/lib/emailService';
import { sendOrderNotification } from '@/lib/telegramService';
import { getProductsFromFile } from '@/lib/productActions';
import { randomUUID } from 'node:crypto';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const orders: any[] = (await kv.get('orders')) || [];
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    // Checkout is public, but product prices and order metadata must be trusted.
    const body = await request.json();
    const invalid = (message: string) =>
      NextResponse.json({ success: false, error: message }, { status: 400 });
    if (!body || typeof body !== 'object' || Array.isArray(body)) return invalid('Invalid order');
    const { customer, delivery, items } = body;
    const validText = (value: unknown, max: number) =>
      typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
    if (!customer || !delivery ||
        !validText(customer.name, 100) || !validText(customer.surname, 100) ||
        !validText(customer.phone, 40) || !validText(delivery.city, 120) ||
        !validText(delivery.address, 200)) return invalid('Invalid customer or delivery details');
    if (customer.email !== undefined && customer.email !== '' &&
        (!validText(customer.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))) {
      return invalid('Invalid email');
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) return invalid('Invalid items');
    if (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 2000)) {
      return invalid('Invalid notes');
    }
    const paymentMethods = ['cashOnDelivery', 'card', 'prepayment'];
    if (!paymentMethods.includes(body.paymentMethod)) return invalid('Invalid payment method');
    const locales = ['uk', 'ru', 'en', 'pl', 'de'];
    const locale = locales.includes(body.locale) ? body.locale : 'uk';

    const products = await getProductsFromFile();
    if (!products.length) {
      return NextResponse.json({ success: false, error: 'Catalog unavailable' }, { status: 503 });
    }
    const catalog = new Map(products.map(product => [product.id, product]));
    const trustedItems = [];
    let total = 0;
    for (const item of items) {
      if (!item || typeof item.id !== 'string' ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return invalid('Invalid item');
      }
      const product = catalog.get(item.id);
      if (!product || !product.inStock || !Number.isFinite(product.price) || product.price < 0) {
        return invalid('Product unavailable');
      }
      trustedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      });
      total += product.price * item.quantity;
    }
    if (!Number.isSafeInteger(total) || total <= 0) return invalid('Invalid total');

    const orderWithMetadata = {
      id: `ORDER-${Date.now()}-${randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      customer: {
        name: customer.name.trim(),
        surname: customer.surname.trim(),
        phone: customer.phone.trim(),
        email: typeof customer.email === 'string' ? customer.email.trim() : '',
      },
      delivery: { city: delivery.city.trim(), address: delivery.address.trim() },
      paymentMethod: body.paymentMethod,
      notes: typeof body.notes === 'string' ? body.notes.trim() : '',
      items: trustedItems,
      total,
      locale,
    };

    // Preview deployments share storage with production in some configurations.
    // Validate the full checkout payload, but never create an order or send
    // customer notifications from a Vercel Preview deployment.
    if (process.env.VERCEL_ENV === 'preview') {
      return NextResponse.json({
        success: true,
        dryRun: true,
        validatedTotal: total,
        validatedItems: trustedItems.map(({ id, quantity, price }) => ({ id, quantity, price })),
      });
    }

    // Existing admin UI reads the orders array. Keep its storage format unchanged.
    const orders: any[] = (await kv.get('orders')) || [];
    orders.unshift(orderWithMetadata);
    await kv.set('orders', orders);

    try {
      await sendOrderEmail(orderWithMetadata);
    } catch (emailError) {
      console.error('Email sending failed, but order was saved:', emailError);
    }
    try {
      await sendOrderNotification({
        orderId: orderWithMetadata.id,
        name: orderWithMetadata.customer.name,
        surname: orderWithMetadata.customer.surname,
        phone: orderWithMetadata.customer.phone,
        email: orderWithMetadata.customer.email,
        address: `${orderWithMetadata.delivery.city} № ${orderWithMetadata.delivery.address}`,
        cartItems: orderWithMetadata.items,
        totalPrice: orderWithMetadata.total,
        createdAt: new Date(orderWithMetadata.createdAt),
      });
    } catch (telegramError) {
      console.error('Telegram notification failed, but order was saved:', telegramError);
    }

    return NextResponse.json({ success: true, order: orderWithMetadata });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ success: false, error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const updateData = await request.json();
    const invalid = (error: string) => NextResponse.json({ success: false, error }, { status: 400 });
    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData) ||
        typeof updateData.orderId !== 'string' || !updateData.orderId.trim()) return invalid('Invalid order ID');

    const allowedStatuses = ['new', 'processing', 'shipped', 'completed', 'cancelled'];
    const validText = (value: unknown, max: number) =>
      typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
    const orders: any[] = (await kv.get('orders')) || [];
    const index = orders.findIndex(order => order.id === updateData.orderId);
    if (index === -1) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    const previous = orders[index];

    if (updateData.fullUpdate === true) {
      const { customer, delivery, items, status, paymentMethod, notes, locale } = updateData;
      if (!allowedStatuses.includes(status) ||
          !customer || typeof customer !== 'object' ||
          !validText(customer.name, 100) || !validText(customer.surname, 100) ||
          !validText(customer.phone, 40) ||
          (customer.email !== '' && customer.email !== undefined &&
           (!validText(customer.email, 254) || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(customer.email))) ||
          !delivery || typeof delivery !== 'object' ||
          !validText(delivery.city, 120) || !validText(delivery.address, 200) ||
          typeof paymentMethod !== 'string' || !['cashOnDelivery', 'card', 'prepayment'].includes(paymentMethod) ||
          typeof notes !== 'string' || notes.length > 2000 ||
          !['uk', 'ru', 'en', 'pl', 'de'].includes(locale) ||
          !Array.isArray(items) || items.length < 1 || items.length > 30) return invalid('Invalid order details');

      let total = 0;
      const safeItems = [];
      for (const item of items) {
        if (!item || !validText(item.id, 200) || !validText(item.name, 300) ||
            !Number.isSafeInteger(item.price) || item.price < 0 ||
            !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 ||
            typeof item.image !== 'string' || item.image.length > 2000) return invalid('Invalid order item');
        total += item.price * item.quantity;
        safeItems.push({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image });
      }
      if (!Number.isSafeInteger(total) || total <= 0) return invalid('Invalid order total');
      orders[index] = {
        ...previous,
        status,
        customer: { name: customer.name.trim(), surname: customer.surname.trim(),
          phone: customer.phone.trim(), email: (customer.email || '').trim() },
        delivery: { city: delivery.city.trim(), address: delivery.address.trim() },
        paymentMethod, notes, locale, items: safeItems, total,
        updatedAt: new Date().toISOString(),
      };
    } else {
      if (!allowedStatuses.includes(updateData.status)) return invalid('Invalid status');
      orders[index] = { ...previous, status: updateData.status, updatedAt: new Date().toISOString() };
    }

    // Save to KV
    await kv.set('orders', orders);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }
    
    // Read existing orders from KV
    let orders: any[] = (await kv.get('orders')) || [];
    
    // Filter out the order to delete
    const filteredOrders = orders.filter((order: any) => order.id !== orderId);
    
    if (filteredOrders.length === orders.length) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    // Save to KV
    await kv.set('orders', filteredOrders);
    
    console.log(`✅ Order ${orderId} deleted successfully`);
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}

