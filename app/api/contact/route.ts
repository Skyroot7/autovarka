import { NextResponse } from 'next/server';
import { sendContactNotification } from '@/lib/telegramService';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Валидация данных
    if (!name || !email || !message || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Отправка в Telegram
    try {
      await sendContactNotification({
        name,
        email,
        phone: phone || 'Не указан',
        subject,
        message,
      });
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Продолжаем, даже если Telegram не сработал
    }

    // Отправка на Email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const subjectMap: Record<string, string> = {
        product: 'Запитання про товар',
        delivery: 'Доставка',
        warranty: 'Гарантія',
        other: 'Інше',
      };

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: `Контактна форма: ${subjectMap[subject] || subject}`,
        html: `
          <h2>Нове повідомлення з контактної форми</h2>
          <p><strong>Ім'я:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Телефон:</strong> ${phone || 'Не вказано'}</p>
          <p><strong>Тема:</strong> ${subjectMap[subject] || subject}</p>
          <p><strong>Повідомлення:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Дата: ${new Date().toLocaleString('uk-UA')}</small></p>
        `,
        text: `
Нове повідомлення з контактної форми

Ім'я: ${name}
Email: ${email}
Телефон: ${phone || 'Не вказано'}
Тема: ${subjectMap[subject] || subject}
Повідомлення:
${message}

Дата: ${new Date().toLocaleString('uk-UA')}
        `,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Продолжаем, даже если email не сработал
    }

    return NextResponse.json({ 
      success: true,
      message: 'Contact form submitted successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
