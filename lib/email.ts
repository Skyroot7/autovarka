import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'info@autovarka.com.ua',
    pass: process.env.EMAIL_PASS || '',
  },
});

export async function sendOrderEmail(orderData: {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  paymentMethod: string;
  notes?: string;
}) {
  const emailHTML = `
    <h2>Нове замовлення</h2>
    <p><strong>Ім'я:</strong> ${orderData.name}</p>
    <p><strong>Email:</strong> ${orderData.email}</p>
    <p><strong>Телефон:</strong> ${orderData.phone}</p>
    <p><strong>Місто:</strong> ${orderData.city}</p>
    <p><strong>Адреса:</strong> ${orderData.address}</p>
    <h3>Товари:</h3>
    <ul>
      ${orderData.items.map(item => `<li>${item.name} x${item.quantity} - ${item.price * item.quantity} ₴</li>`).join('')}
    </ul>
    <p><strong>Загальна сума:</strong> ${orderData.total} ₴</p>
    <p><strong>Спосіб оплати:</strong> ${orderData.paymentMethod}</p>
    ${orderData.notes ? `<p><strong>Примітки:</strong> ${orderData.notes}</p>` : ''}
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'info@autovarka.com.ua',
      to: 'info@autovarka.com.ua',
      subject: `Нове замовлення від ${orderData.name}`,
      html: emailHTML,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendContactEmail(contactData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const emailHTML = `
    <h2>Повідомлення з форми контактів</h2>
    <p><strong>Ім'я:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    ${contactData.phone ? `<p><strong>Телефон:</strong> ${contactData.phone}</p>` : ''}
    <p><strong>Тема:</strong> ${contactData.subject}</p>
    <p><strong>Повідомлення:</strong></p>
    <p>${contactData.message}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'info@autovarka.com.ua',
      to: 'info@autovarka.com.ua',
      subject: `Контакт: ${contactData.subject}`,
      html: emailHTML,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

