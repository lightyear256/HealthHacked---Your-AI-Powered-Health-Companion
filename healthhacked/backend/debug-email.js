require('dotenv').config();
const config = require('./src/config');

console.log('🔍 Debugging Email Configuration\n');

console.log('Environment Variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***hidden***' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

console.log('\nConfig Object:');
console.log('config.email:', config.email);

console.log('\nChecking individual fields:');
console.log('config.email exists:', !!config.email);
console.log('config.email.host exists:', !!config.email?.host);
console.log('config.email.user exists:', !!config.email?.user);
console.log('config.email.pass exists:', !!config.email?.pass);

console.log('\nFull email config:');
console.log(JSON.stringify(config.email, null, 2));