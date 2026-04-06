// scripts/create-test-user.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// ✅ ใช้ MongoDB Atlas URL จาก .env ของคุณ
const MONGODB_URI = 'mongodb+srv://eleclabs:6Eba0874@cluster0.x4wuv.gcp.mongodb.net/advisor?retryWrites=true&w=majority';

console.log("=".repeat(50));
console.log("🚀 เริ่มสร้างผู้ใช้ทดสอบ");
console.log("🔌 Connecting to MongoDB Atlas...");

async function createTestUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("✅ เชื่อมต่อ MongoDB Atlas สำเร็จ");
    
    const db = client.db('advisor'); // ใช้ database 'advisor'
    const users = db.collection('users');
    
    // ตรวจสอบ connection
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // ลบผู้ใช้เก่า
    const deleteResult = await users.deleteMany({ 
      email: { 
        $in: [
          'admin@test.com', 
          'teacher@test.com', 
          'executive@test.com', 
          'committee@test.com'
        ] 
      }
    });
    console.log(`🗑️ ลบผู้ใช้เก่า: ${deleteResult.deletedCount} คน`);
    
    // สร้างผู้ใช้ 4 คน
    const testUsers = [
      {
        email: 'admin@test.com',
        password: await bcrypt.hash('123456', 10),
        provider: 'credentials',
        first_name: 'Admin',
        last_name: 'System',
        role: 'ADMIN',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'teacher@test.com',
        password: await bcrypt.hash('123456', 10),
        provider: 'credentials',
        first_name: 'Teacher',
        last_name: 'Test',
        role: 'TEACHER',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'executive@test.com',
        password: await bcrypt.hash('123456', 10),
        provider: 'credentials',
        first_name: 'Executive',
        last_name: 'Test',
        role: 'EXECUTIVE',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'committee@test.com',
        password: await bcrypt.hash('123456', 10),
        provider: 'credentials',
        first_name: 'Committee',
        last_name: 'Test',
        role: 'COMMITTEE',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await users.insertMany(testUsers);
    console.log(`✅ สร้างผู้ใช้สำเร็จ ${result.insertedCount} คน`);
    
    // ตรวจสอบจำนวนผู้ใช้ทั้งหมด
    const totalUsers = await users.countDocuments();
    console.log(`📊 จำนวนผู้ใช้ทั้งหมดในระบบ: ${totalUsers} คน`);
    
    // แสดงรายการผู้ใช้ที่สร้าง
    const createdUsers = await users.find({
      email: { $in: testUsers.map(u => u.email) }
    }).project({ email: 1, role: 1, _id: 0 }).toArray();
    
    console.log("\n📋 ผู้ใช้ที่สร้างสำเร็จ:");
    createdUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });
    
    console.log("\n🔑 รหัสผ่านทั้งหมด: 123456");
    
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  } finally {
    await client.close();
    console.log("🔌 ปิดการเชื่อมต่อ MongoDB");
    console.log("=".repeat(50));
  }
}

createTestUsers();