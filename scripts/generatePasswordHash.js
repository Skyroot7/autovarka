/**
 * Скрипт для генерации хеша пароля администратора
 * Использование: node scripts/generatePasswordHash.js ваш_пароль
 */

const crypto = require('crypto');

function generatePasswordHash(password) {
  // Генерируем соль
  const salt = crypto.randomBytes(32).toString('hex');
  
  // Хешируем пароль с солью
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  
  return { hash, salt };
}

// Получаем пароль из аргументов командной строки
const password = process.argv[2];

if (!password) {
  console.error('\n❌ Ошибка: Не указан пароль');
  console.log('\n📝 Использование:');
  console.log('   node scripts/generatePasswordHash.js ваш_пароль\n');
  console.log('📋 Пример:');
  console.log('   node scripts/generatePasswordHash.js MySecurePassword123!\n');
  process.exit(1);
}

console.log('\n🔐 Генерация хеша пароля...\n');

const { hash, salt } = generatePasswordHash(password);

console.log('✅ Хеш успешно сгенерирован!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📋 Добавьте эти переменные в ваш .env.local файл:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('# Учетные данные администратора');
console.log('ADMIN_USERNAME=admin');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_PASSWORD_SALT=${salt}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  ВАЖНО:');
console.log('   1. Скопируйте эти переменные в .env.local');
console.log('   2. На Vercel добавьте их в Environment Variables');
console.log('   3. После добавления можете удалить ADMIN_PASSWORD');
console.log('   4. НЕ комитьте .env.local в git!\n');
console.log('🔒 Для Vercel:');
console.log('   Settings → Environment Variables → Add New\n');
