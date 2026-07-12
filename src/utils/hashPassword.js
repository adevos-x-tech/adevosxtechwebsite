// Run with: npm run hash-password
// Then paste the printed hash into ADMIN_PASSWORD_HASH in your .env file.
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Andika password unayotaka kwa admin: ', async (password) => {
  if (!password || password.trim().length < 4) {
    console.log('❌ Password ni fupi mno. Jaribu tena na herufi 4 au zaidi.');
    rl.close();
    return;
  }
  const hash = await bcrypt.hash(password.trim(), 10);
  console.log('\n✅ Weka mstari huu kwenye .env yako:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  rl.close();
});
