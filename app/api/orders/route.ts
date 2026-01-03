import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sendOrderEmail } from '@/lib/emailService';
import { sendOrderNotification } from '@/lib/telegramService';

const ordersFilePath = path.join(process.cwd(), 'lib', 'orders.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    const orders = JSON.parse(fileContents);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    
    // Read existing orders
    let orders = [];
    try {
      const fileContents = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(fileContents);
    } catch (error) {
      // If file doesn't exist, start with empty array
      orders = [];
    }
    
    // Add new order with ID and timestamp
    const orderWithMetadata = {
      id: `ORDER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      ...newOrder,
    };
    
    orders.unshift(orderWithMetadata); // Add to beginning
    
    // Save to file
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    
    // Send email notification
    try {
      await sendOrderEmail(orderWithMetadata);
    } catch (emailError) {
      console.error('Email sending failed, but order was saved:', emailError);
      // Не блокируем успешный ответ даже если email не отправился
    }
    
    // Send Telegram notification
    try {
      await sendOrderNotification({
        orderId: orderWithMetadata.id,
        name: orderWithMetadata.customer?.name || '',
        surname: orderWithMetadata.customer?.surname || '',
        phone: orderWithMetadata.customer?.phone || '',
        email: orderWithMetadata.customer?.email || '',
        address: `${orderWithMetadata.delivery?.city || ''}, ${orderWithMetadata.delivery?.address || ''}`,
        cartItems: orderWithMetadata.items || [],
        totalPrice: orderWithMetadata.total || 0,
        createdAt: new Date(orderWithMetadata.createdAt),
      });
    } catch (telegramError) {
      console.error('Telegram notification failed, but order was saved:', telegramError);
      // Не блокируем успешный ответ даже если Telegram не отправился
    }
    
    return NextResponse.json({ success: true, order: orderWithMetadata });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ success: false, error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const updateData = await request.json();
    const { orderId, status, fullUpdate } = updateData;
    
    // Read existing orders
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    let orders = JSON.parse(fileContents);
    
    if (fullUpdate) {
      // Full order update (for editing)
      orders = orders.map((order: any) => {
        if (order.id === orderId) {
          return {
            ...updateData,
            id: orderId, // Keep original ID
            createdAt: order.createdAt, // Keep original creation date
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      });
    } else {
      // Simple status update
      orders = orders.map((order: any) => 
        order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
      );
    }
    
    // Save to file
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }
    
    // Read existing orders
    const fileContents = await fs.readFile(ordersFilePath, 'utf8');
    let orders = JSON.parse(fileContents);
    
    // Filter out the order to delete
    const filteredOrders = orders.filter((order: any) => order.id !== orderId);
    
    if (filteredOrders.length === orders.length) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    // Save to file
    await fs.writeFile(ordersFilePath, JSON.stringify(filteredOrders, null, 2), 'utf8');
    
    console.log(`✅ Order ${orderId} deleted successfully`);
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 });
  }
}

