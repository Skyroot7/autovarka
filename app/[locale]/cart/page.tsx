'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useState } from 'react';
import SafeImage from '@/components/SafeImage';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const getTotal = useCartStore(state => state.getTotal);
  const clearCart = useCartStore(state => state.clearCart);

  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
    paymentMethod: 'cashOnDelivery',
  });

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer: {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
        },
        delivery: {
          city: formData.city,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: getTotal(),
        locale: locale,
      };
      
      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit order: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Замовлення ${result.order.id} успішно відправлено! Ми зв'яжемося з вами найближчим часом.`);
        clearCart();
        setShowCheckout(false);
        setFormData({
          name: '',
          surname: '',
          email: '',
          phone: '',
          city: '',
          address: '',
          notes: '',
          paymentMethod: 'cashOnDelivery',
        });
      } else {
        alert('Помилка при відправці замовлення. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Помилка при відправці замовлення. Спробуйте ще раз.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('empty')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Почніть покупки прямо зараз!
          </p>
          <Link
            href={locale === 'uk' ? '/products' : `/${locale}/products`}
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {tCommon('cart')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex-shrink-0 mx-auto sm:mx-0">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="128px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {item.price * item.quantity} ₴
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-gray-500">
                          {item.price} ₴ / шт
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-4 text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('orderSummary')}
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-bold text-gray-900">
                    {getTotal()} ₴
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">{t('delivery')}</span>
                  <span className="font-bold text-green-600">
                    {t('carrierRate')}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-2xl">
                    <span className="font-bold text-gray-900">{t('total')}</span>
                    <span className="font-bold text-orange-600">
                      {getTotal()} ₴
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors mb-4"
              >
                {tCommon('checkout')}
              </button>

              <Link
                href={locale === 'uk' ? '/products' : `/${locale}/products`}
                className="block w-full text-center bg-gray-100 text-gray-900 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>

        {/* Checkout Form Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('orderForm.title')}
                </h2>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {t('orderForm.customerInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tCommon('name')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tCommon('surname')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.surname}
                          onChange={(e) => setFormData({...formData, surname: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tCommon('phone')}
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tCommon('email')} <span className="text-gray-500 text-xs">(необов'язково)</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {t('orderForm.deliveryAddress')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('orderForm.city')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('orderForm.address')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('orderForm.paymentMethod')}
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cashOnDelivery">{t('orderForm.cashOnDelivery')}</option>
                      <option value="card">{t('orderForm.card')}</option>
                      <option value="prepayment">{t('orderForm.prepayment')}</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('orderForm.notes')}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    ></textarea>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-300"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder && (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmittingOrder ? 'Обробка...' : t('orderForm.confirmOrder')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

