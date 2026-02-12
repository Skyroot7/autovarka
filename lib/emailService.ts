import nodemailer from 'nodemailer';

interface OrderEmailData {
  orderId: string;
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
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  paymentMethod: string;
  notes?: string;
  locale: string;
}

const createTransporter = () => {
  // Проверяем наличие настроек SMTP
  if (!process.env.SMTP_HOST) {
    console.log('⚠️ SMTP не настроен. Email не будет отправлен (это нормально для локальной разработки).');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true для 465 (SSL), false для 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Для самоподписанных сертификатов
    },
  });
};

const getPaymentMethodLabel = (method: string, locale: string) => {
  const labels: Record<string, Record<string, string>> = {
    cashOnDelivery: {
      uk: 'Оплата при отриманні',
      ru: 'Оплата при получении',
      en: 'Cash on Delivery',
      pl: 'Płatność przy odbiorze',
      de: 'Nachnahme',
    },
    card: {
      uk: 'Оплата карткою',
      ru: 'Оплата картой',
      en: 'Card Payment',
      pl: 'Płatność kartą',
      de: 'Kartenzahlung',
    },
    prepayment: {
      uk: 'Передоплата',
      ru: 'Предоплата',
      en: 'Prepayment',
      pl: 'Przedpłata',
      de: 'Vorauszahlung',
    },
  };
  
  return labels[method]?.[locale] || method;
};

const createEmailTemplate = (data: OrderEmailData) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${item.price} ₴
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong style="color: #f97316;">${item.price * item.quantity} ₴</strong>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Новый заказ #${data.orderId}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(to right, #f97316, #ea580c); padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px;">
                      🚗 Автоварка
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px;">
                      Новый заказ с сайта
                    </p>
                  </td>
                </tr>

                <!-- Order ID -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #fef3c7; border-bottom: 3px solid #f59e0b;">
                    <h2 style="margin: 0; color: #92400e; font-size: 24px;">
                      📦 Заказ #${data.orderId}
                    </h2>
                    <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">
                      ${new Date().toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </td>
                </tr>

                <!-- Customer Info -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                      👤 Данные клиента
                    </h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Имя:</td>
                        <td style="color: #1f2937;">${data.customer.name} ${data.customer.surname}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Телефон:</td>
                        <td style="color: #1f2937;">
                          <a href="tel:${data.customer.phone}" style="color: #f97316; text-decoration: none;">
                            ${data.customer.phone}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Email:</td>
                        <td style="color: #1f2937;">
                          <a href="mailto:${data.customer.email}" style="color: #f97316; text-decoration: none;">
                            ${data.customer.email}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Info -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                      🚚 Адрес доставки
                    </h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Город:</td>
                        <td style="color: #1f2937;">${data.delivery.city}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Адрес/Отделение:</td>
                        <td style="color: #1f2937;">${data.delivery.address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                      🛒 Состав заказа
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f9fafb;">
                          <th style="padding: 12px; text-align: left; color: #374151; font-weight: bold; border-bottom: 2px solid #e5e7eb;">Товар</th>
                          <th style="padding: 12px; text-align: center; color: #374151; font-weight: bold; border-bottom: 2px solid #e5e7eb;">Кол-во</th>
                          <th style="padding: 12px; text-align: right; color: #374151; font-weight: bold; border-bottom: 2px solid #e5e7eb;">Цена</th>
                          <th style="padding: 12px; text-align: right; color: #374151; font-weight: bold; border-bottom: 2px solid #e5e7eb;">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr style="background-color: #fef3c7;">
                          <td colspan="3" style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #1f2937;">
                            ИТОГО:
                          </td>
                          <td style="padding: 16px; text-align: right; font-size: 24px; font-weight: bold; color: #f97316;">
                            ${data.total} ₴
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>

                <!-- Payment & Notes -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-weight: bold; vertical-align: top;">💳 Способ оплаты:</td>
                        <td style="color: #1f2937;">${getPaymentMethodLabel(data.paymentMethod, data.locale)}</td>
                      </tr>
                      ${data.notes ? `
                      <tr>
                        <td style="color: #6b7280; font-weight: bold; vertical-align: top;">📝 Примечания:</td>
                        <td style="color: #1f2937;">${data.notes}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                      Это автоматическое уведомление с сайта
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                      🚗 <strong style="color: #ffffff;">Автоварка</strong> | 📞 +38 (063) 681-50-90
                    </p>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                      <a href="https://autovarka.com.ua" style="color: #f97316; text-decoration: none;">
                        autovarka.com.ua
                      </a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export async function sendOrderEmail(orderData: OrderEmailData): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    // Если SMTP не настроен - просто логируем и возвращаем true
    if (!transporter) {
      console.log('📧 Email не отправлен (SMTP не настроен). Заказ сохранен в базе данных.');
      return true;
    }

    const emailTo = process.env.EMAIL_TO || 'skd7@ukr.net';
    const emailHtml = createEmailTemplate(orderData);

    const mailOptions = {
      from: `"🚗 Автоварка" <${process.env.SMTP_USER}>`,
      to: emailTo,
      subject: `🛒 Новый заказ #${orderData.orderId} - ${orderData.customer.name} ${orderData.customer.surname}`,
      html: emailHtml,
      // Текстовая версия для клиентов без HTML
      text: `
Новый заказ #${orderData.orderId}

Клиент: ${orderData.customer.name} ${orderData.customer.surname}
Телефон: ${orderData.customer.phone}
Email: ${orderData.customer.email}

Доставка:
Город: ${orderData.delivery.city}
Адрес: ${orderData.delivery.address}

Товары:
${orderData.items.map(item => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} ₴`).join('\n')}

ИТОГО: ${orderData.total} ₴

Способ оплаты: ${getPaymentMethodLabel(orderData.paymentMethod, orderData.locale)}
${orderData.notes ? `\nПримечания: ${orderData.notes}` : ''}

---
Автоварка
+38 (063) 681-50-90
autovarka.com.ua
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email отправлен на ${emailTo} для заказа #${orderData.orderId}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке email:', error);
    // Возвращаем true, чтобы заказ все равно был сохранен
    return true;
  }
}

