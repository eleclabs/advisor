const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/advisor');
    console.log('Connected to MongoDB');
    
    // ตั้งรหัสผ่านใหม่สำหรับ admin@test.com
    const adminPassword = '123456';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@test.com' },
      { $set: { password: hashedAdminPassword } }
    );
    
    console.log('✅ Reset password for admin@test.com to: 123456');
    
    // ตั้งรหัสผ่านใหม่สำหรับ teacher@test.com
    const teacherPassword = '123456';
    const hashedTeacherPassword = await bcrypt.hash(teacherPassword, 10);
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'teacher@test.com' },
      { $set: { password: hashedTeacherPassword } }
    );
    
    console.log('✅ Set password for teacher@test.com to: 123456');
    
    // ตั้งรหัสผ่านใหม่สำหรับ executive@test.com
    const executivePassword = '123456';
    const hashedExecutivePassword = await bcrypt.hash(executivePassword, 10);
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'executive@test.com' },
      { $set: { password: hashedExecutivePassword } }
    );
    
    console.log('✅ Reset password for executive@test.com to: 123456');
    
    // ตั้งรหัสผ่านใหม่สำหรับ committee@test.com
    const committeePassword = '123456';
    const hashedCommitteePassword = await bcrypt.hash(committeePassword, 10);
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'committee@test.com' },
      { $set: { password: hashedCommitteePassword } }
    );
    
    console.log('✅ Reset password for committee@test.com to: 123456');
    
    console.log('\n🔑 Login Credentials:');
    console.log('Email: admin@test.com | Password: 123456 | Role: ADMIN');
    console.log('Email: teacher@test.com | Password: 123456 | Role: TEACHER');
    console.log('Email: executive@test.com | Password: 123456 | Role: EXECUTIVE');
    console.log('Email: committee@test.com | Password: 123456 | Role: COMMITTEE');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPasswords();
