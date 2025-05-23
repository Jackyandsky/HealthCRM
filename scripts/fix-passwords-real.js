const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

async function fixPasswords() {
  try {
    // 连接数据库
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Connected to MongoDB');

    // 定义User模型
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      phone: String,
      department: String,
      isActive: Boolean,
    }, { timestamps: true });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // 生成正确的密码哈希
    console.log('🔐 Generating correct password hashes...');
    
    const adminHash = await bcrypt.hash('admin123', 12);
    const doctorHash = await bcrypt.hash('doctor123', 12);
    const nurseHash = await bcrypt.hash('nurse123', 12);
    const receptionHash = await bcrypt.hash('reception123', 12);
    
    console.log('Generated hashes:');
    console.log('admin123:', adminHash);
    console.log('doctor123:', doctorHash);
    console.log('nurse123:', nurseHash);
    console.log('reception123:', receptionHash);
    
    // 验证哈希是否正确
    console.log('\n🧪 Verifying hashes:');
    console.log('admin123 verify:', await bcrypt.compare('admin123', adminHash));
    console.log('doctor123 verify:', await bcrypt.compare('doctor123', doctorHash));
    console.log('nurse123 verify:', await bcrypt.compare('nurse123', nurseHash));
    console.log('reception123 verify:', await bcrypt.compare('reception123', receptionHash));

    // 更新数据库中的用户
    console.log('\n📝 Updating users in database...');
    
    await User.findOneAndUpdate(
      { email: 'admin@healthcrm.com' },
      { password: adminHash }
    );
    
    await User.findOneAndUpdate(
      { email: 'dr.johnson@healthcrm.com' },
      { password: doctorHash }
    );
    
    await User.findOneAndUpdate(
      { email: 'dr.chen@healthcrm.com' },
      { password: doctorHash }
    );
    
    await User.findOneAndUpdate(
      { email: 'nurse.wong@healthcrm.com' },
      { password: nurseHash }
    );
    
    await User.findOneAndUpdate(
      { email: 'receptionist@healthcrm.com' },
      { password: receptionHash }
    );

    console.log('✅ All passwords updated successfully!');
    console.log('\n🔐 Test Login Credentials:');
    console.log('Admin: admin@healthcrm.com / admin123');
    console.log('Doctor: dr.johnson@healthcrm.com / doctor123');
    console.log('Nurse: nurse.wong@healthcrm.com / nurse123');
    console.log('Receptionist: receptionist@healthcrm.com / reception123');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();
