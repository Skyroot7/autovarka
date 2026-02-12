// @ts-ignore - типы для node-telegram-bot-api отсутствуют
import TelegramBot from 'node-telegram-bot-api';

// Инициализация бота
let bot: any | null = null;

const initBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && !bot) {
    bot = new TelegramBot(token, { polling: false });
  }
  return bot;
};

// Отправка уведомления о заказе
export async function sendOrderNotification(orderData: {
  orderId: string;
  name: string;
  surname?: string;
  phone: string;
  email: string;
  address: string;
  cartItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  createdAt: Date;
}): Promise<boolean> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!chatId) {
    console.log('❌ Telegram Chat ID не настроен');
    return false;
  }

  const telegramBot = initBot();
  if (!telegramBot) {
    console.log('❌ Telegram Bot не инициализирован');
    return false;
  }

  // Формирование сообщения
  const itemsList = orderData.cartItems
    .map((item, index) => 
      `${index + 1}. ${item.name}\n   ├ Количество: ${item.quantity} шт\n   └ Цена: ${item.price} грн`
    )
    .join('\n\n');

  const message = `
🛒 *НОВЫЙ ЗАКАЗ №${orderData.orderId}*

👤 *Клиент:*
├ Имя: ${orderData.name}${orderData.surname ? ' ' + orderData.surname : ''}
├ Телефон: ${orderData.phone}
├ Email: ${orderData.email}
└ Адрес: ${orderData.address}

📦 *Товары:*
${itemsList}

💰 *Общая сумма:* ${orderData.totalPrice} грн

📅 *Дата:* ${new Date(orderData.createdAt).toLocaleString('ru-RU')}

━━━━━━━━━━━━━━━━━
🔔 Не забудьте обработать заказ!
`;

  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Уведомление о заказе отправлено в Telegram');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления о заказе в Telegram:', error);
    return false;
  }
}

// Отправка уведомления о контактной форме
export async function sendContactNotification(contactData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!chatId) {
    console.log('❌ Telegram Chat ID не настроен');
    return false;
  }

  const telegramBot = initBot();
  if (!telegramBot) {
    console.log('❌ Telegram Bot не инициализирован');
    return false;
  }

  const message = `
📧 *НОВОЕ СООБЩЕНИЕ С ФОРМЫ*

👤 *От:* ${contactData.name}
📱 *Телефон:* ${contactData.phone}
✉️ *Email:* ${contactData.email}

📋 *Тема:* ${contactData.subject}

💬 *Сообщение:*
${contactData.message}

━━━━━━━━━━━━━━━━━
🔔 Ответьте быстрее!
`;

  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('✅ Уведомление о контакте отправлено в Telegram');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    return false;
  }
}

