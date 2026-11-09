'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth } from '@/lib/auth';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  customer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  delivery: {
    city: string;
    address: string;
  };
  paymentMethod: string;
  notes: string;
  items: OrderItem[];
  total: number;
  locale: string;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  completed: 'Завершен',
  cancelled: 'Отменен',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);

  // Check login status
  useEffect(() => {
    checkAuth().then(authenticated => {
      if (authenticated) setIsLoggedIn(true);
      else router.push('/admin');
    });
  }, [router]);

  useEffect(() => {
    console.log('isLoggedIn changed:', isLoggedIn);
    if (isLoggedIn) {
      console.log('User is logged in, fetching orders...');
      fetchOrders();
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from /api/orders...');
      const response = await fetch('/api/orders');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      console.log('Orders received:', data);
      console.log('Number of orders:', data.length);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId);
          if (updatedOrder) {
            setSelectedOrder({ ...updatedOrder, status: newStatus as any });
          }
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const startEditing = (order: Order) => {
    setEditedOrder(JSON.parse(JSON.stringify(order))); // Deep copy
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedOrder(null);
  };

  const saveOrder = async () => {
    if (!editedOrder) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedOrder,
          orderId: editedOrder.id,
          fullUpdate: true,
        }),
      });

      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(editedOrder);
        setIsEditing(false);
        setEditedOrder(null);
        alert('✅ Заказ успешно обновлен');
      } else {
        alert('❌ Ошибка при сохранении заказа');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('❌ Произошла ошибка при сохранении');
    }
  };

  const updateEditedOrderField = (field: string, value: any) => {
    if (!editedOrder) return;
    
    if (field.includes('.')) {
      // Nested field (e.g., 'customer.name')
      const [parent, child] = field.split('.');
      setEditedOrder({
        ...editedOrder,
        [parent]: {
          ...(editedOrder as any)[parent],
          [child]: value,
        },
      });
    } else {
      setEditedOrder({
        ...editedOrder,
        [field]: value,
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    // Подтверждение удаления
    const confirmDelete = window.confirm(
      `Вы уверены, что хотите удалить заказ ${orderId}?\n\nЭто действие нельзя отменить.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        // Закрыть модальное окно если оно открыто
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        // Обновить список заказов
        await fetchOrders();
        alert('✅ Заказ успешно удален');
      } else {
        const data = await response.json();
        alert(`❌ Ошибка: ${data.error || 'Не удалось удалить заказ'}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('❌ Произошла ошибка при удалении заказа');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  console.log('Current state:', {
    loading,
    isLoggedIn,
    ordersCount: orders.length,
    filterStatus,
    filteredOrdersCount: filteredOrders.length
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isLoggedIn || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{!isLoggedIn ? 'Проверка авторизации...' : 'Загрузка заказов...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Заказы</h1>
            <p className="text-gray-600">Управление заказами клиентов</p>
          </div>
          <Link
            href="/uk/admin"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к панели
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Всего заказов</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'new').length}
            </div>
            <div className="text-sm text-blue-600">Новых</div>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'processing').length}
            </div>
            <div className="text-sm text-yellow-600">В обработке</div>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
            <div className="text-sm text-purple-600">Отправлено</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-green-600">Завершено</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'new' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Новые ({orders.filter(o => o.status === 'new').length})
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'processing' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              }`}
            >
              В обработке ({orders.filter(o => o.status === 'processing').length})
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'shipped' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              Отправлено ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              Завершено ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказов пока нет</h2>
            <p className="text-gray-600">Когда клиенты оформят заказы, они появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Клиент:</p>
                        <p className="font-semibold text-gray-900">
                          {order.customer.name} {order.customer.surname}
                        </p>
                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Доставка:</p>
                        <p className="font-semibold text-gray-900">{order.delivery.city}</p>
                        <p className="text-sm text-gray-600">{order.delivery.address}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Товары ({order.items.length}):</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                            <span className="text-orange-600 font-semibold">{item.price * item.quantity} ₴</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Дата: {formatDate(order.createdAt)}</p>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-1">Примечание: {order.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{order.total} ₴</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="new">Новый</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                    
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all text-sm"
                    >
                      Подробнее
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        startEditing(order);
                      }}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Редактировать
                    </button>
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Детали заказа</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Информация о заказе</h3>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> {selectedOrder.id}</p>
                      <p><strong>Дата:</strong> {formatDate(selectedOrder.createdAt)}</p>
                      <p><strong>Статус:</strong> <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status]}`}>
                        {statusLabels[selectedOrder.status]}
                      </span></p>
                      <p><strong>Язык:</strong> {selectedOrder.locale.toUpperCase()}</p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Данные клиента</h3>
                        <div className="space-y-2">
                          <p><strong>Имя:</strong> {selectedOrder.customer.name} {selectedOrder.customer.surname}</p>
                          <p><strong>Телефон:</strong> {selectedOrder.customer.phone}</p>
                          <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Адрес доставки</h3>
                        <div className="space-y-2">
                          <p><strong>Город:</strong> {selectedOrder.delivery.city}</p>
                          <p><strong>Адрес:</strong> {selectedOrder.delivery.address}</p>
                        </div>
                      </div>
                    </>
                  ) : editedOrder && (
                    <>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Данные клиента</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Имя:</label>
                            <input
                              type="text"
                              value={editedOrder.customer.name}
                              onChange={(e) => updateEditedOrderField('customer.name', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Фамилия:</label>
                            <input
                              type="text"
                              value={editedOrder.customer.surname}
                              onChange={(e) => updateEditedOrderField('customer.surname', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон:</label>
                            <input
                              type="text"
                              value={editedOrder.customer.phone}
                              onChange={(e) => updateEditedOrderField('customer.phone', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email:</label>
                            <input
                              type="email"
                              value={editedOrder.customer.email}
                              onChange={(e) => updateEditedOrderField('customer.email', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Адрес доставки</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Город:</label>
                            <input
                              type="text"
                              value={editedOrder.delivery.city}
                              onChange={(e) => updateEditedOrderField('delivery.city', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Адрес:</label>
                            <input
                              type="text"
                              value={editedOrder.delivery.address}
                              onChange={(e) => updateEditedOrderField('delivery.address', e.target.value)}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Товары</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-orange-200 last:border-0">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.price} ₴ x {item.quantity}</p>
                          </div>
                          <p className="font-bold text-orange-600">{item.price * item.quantity} ₴</p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-orange-300">
                        <p className="text-xl font-bold text-gray-900">Итого:</p>
                        <p className="text-2xl font-bold text-orange-600">{selectedOrder.total} ₴</p>
                      </div>
                    </div>
                  </div>

                  {!isEditing ? (
                    selectedOrder.notes && (
                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Примечания</h3>
                        <p className="text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    )
                  ) : editedOrder && (
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 text-lg">Примечания</h3>
                      <textarea
                        value={editedOrder.notes || ''}
                        onChange={(e) => updateEditedOrderField('notes', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-h-[100px]"
                        placeholder="Добавьте примечания к заказу..."
                      />
                    </div>
                  )}

                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Оплата</h3>
                    <p><strong>Способ оплаты:</strong> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => startEditing(selectedOrder)}
                        className="flex-1 min-w-[150px] bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteOrder(selectedOrder.id)}
                        className="flex-1 min-w-[150px] bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex-1 min-w-[150px] bg-gray-200 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Закрыть
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={saveOrder}
                        className="flex-1 min-w-[150px] bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 min-w-[150px] bg-gray-200 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Отмена
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

