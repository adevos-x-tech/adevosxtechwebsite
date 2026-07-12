// Run with: npm run generate-2fa
// Scan the printed otpauth:// URL with Google Authenticator / Authy
// (paste it into any "otpauth URL to QR code" site, or a QR app that
// accepts text), then paste the secret into ADMIN_2FA_SECRET in .env.
const { authenticator } = require('otplib');

const secret = authenticator.generateSecret();
const otpauthUrl = authenticator.keyuri('admin', 'Adevos-X Admin', secret);

console.log('\n✅ Weka mstari huu kwenye .env yako:\n');
console.log(`ADMIN_2FA_SECRET=${secret}\n`);
console.log('📱 Scan/paste URL hii kwenye Google Authenticator au Authy:\n');
console.log(otpauthUrl + '\n');
