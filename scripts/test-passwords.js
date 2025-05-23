const bcrypt = require('bcryptjs');

async function testPasswords() {
  console.log('🧪 Testing password hashes...\n');
  
  // 这些是我在数据库中使用的实际哈希值
  const hashes = {
    'admin123': '$2a$12$7ZrZnz4QjQHKjDWGPvO7.OFnGDCwYWCLMfEbhDdyxL5x5YvXj3Gma',
    'doctor123': '$2a$12$CQKOqazpZhGz6QoN0kcNVOjlCCUeqjLOA.XJ.j3eaOWBhUtzqKPHS', 
    'nurse123': '$2a$12$RjYgPKbwCsEzCWdTnlE.aujWBEWRF.Lg0.8mFqNdLxBF4wlDNvMGW',
    'reception123': '$2a$12$vFj.7gG4oCGqYOWz5YJVCOx6B.rKKnkpLFKaU8jDxU8mFqR8NpZ6S'
  };
  
  for (const [password, hash] of Object.entries(hashes)) {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`${password}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  console.log('\n🔑 Generating new correct hashes:');
  
  const passwords = ['admin123', 'doctor123', 'nurse123', 'reception123'];
  for (const password of passwords) {
    const newHash = await bcrypt.hash(password, 12);
    const testResult = await bcrypt.compare(password, newHash);
    console.log(`${password}: ${newHash} - Test: ${testResult ? '✅' : '❌'}`);
  }
}

testPasswords().catch(console.error);
