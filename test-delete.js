const { MongoClient } = require('mongodb');

async function testDelete() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("🔗 Connected to MongoDB");
    
    const db = client.db("advisor");
    
    // ตรวจสอบข้อมูลก่อนลบ
    console.log("\n📊 ตรวจสอบข้อมูลก่อนลบ:");
    
    const studentCount = await db.collection("students").countDocuments();
    console.log(`👥 Students: ${studentCount}`);
    
    const problemCount = await db.collection("problems").countDocuments();
    console.log(`📋 Problems: ${problemCount}`);
    
    const referralCount = await db.collection("referrals").countDocuments();
    console.log(`📤 Referrals: ${referralCount}`);
    
    // แสดงตัวอย่างข้อมูล
    console.log("\n📋 ตัวอย่างข้อมูล Problems:");
    const sampleProblems = await db.collection("problems").find({}).limit(3).toArray();
    sampleProblems.forEach((p, i) => {
      console.log(`  ${i+1}. student_id: ${p.student_id}, student_name: ${p.student_name}`);
    });
    
    console.log("\n📤 ตัวอย่างข้อมูล Referrals:");
    const sampleReferrals = await db.collection("referrals").find({}).limit(3).toArray();
    sampleReferrals.forEach((r, i) => {
      console.log(`  ${i+1}. student_id: ${r.student_id}, student_name: ${r.student_name}`);
    });
    
    // หา student_id ตัวอย่าง
    const sampleStudent = await db.collection("students").findOne();
    if (sampleStudent) {
      console.log(`\n🎯 ทดสอบลบนักเรียน ID: ${sampleStudent._id} (MongoDB ObjectId)`);
      console.log(`🎯 และ ID: ${sampleStudent.id || sampleStudent._id.toString()} (student_id field)`);
      
      // ตรวจสอบข้อมูลที่เกี่ยวข้องด้วยทั้งสอง ID
      console.log("\n🔍 ตรวจสอบข้อมูลที่เกี่ยวข้อง:");
      
      const relatedProblemsByObjectId = await db.collection("problems").countDocuments({ student_id: sampleStudent._id.toString() });
      console.log(`📋 ปัญหา (by ObjectId): ${relatedProblemsByObjectId} รายการ`);
      
      const relatedProblemsByStudentId = await db.collection("problems").countDocuments({ student_id: sampleStudent.id || sampleStudent._id.toString() });
      console.log(`📋 ปัญหา (by student_id): ${relatedProblemsByStudentId} รายการ`);
      
      const relatedReferralsByObjectId = await db.collection("referrals").countDocuments({ student_id: sampleStudent._id.toString() });
      console.log(`📤 การส่งต่อ (by ObjectId): ${relatedReferralsByObjectId} รายการ`);
      
      const relatedReferralsByStudentId = await db.collection("referrals").countDocuments({ student_id: sampleStudent.id || sampleStudent._id.toString() });
      console.log(`📤 การส่งต่อ (by student_id): ${relatedReferralsByStudentId} รายการ`);
      
      // ลบข้อมูลที่เกี่ยวข้อง
      console.log("\n🧹 เริ่มลบข้อมูลที่เกี่ยวข้อง...");
      
      const deleteProblems = await db.collection("problems").deleteMany({ student_id: sampleStudent._id.toString() });
      console.log(`📋 ลบปัญหา: ${deleteProblems.deletedCount} รายการ`);
      
      const deleteReferrals = await db.collection("referrals").deleteMany({ student_id: sampleStudent._id.toString() });
      console.log(`📤 ลบการส่งต่อ: ${deleteReferrals.deletedCount} รายการ`);
      
      const deleteStudent = await db.collection("students").deleteOne({ _id: sampleStudent._id });
      console.log(`👥 ลบนักเรียน: ${deleteStudent.deletedCount} รายการ`);
      
      console.log("\n✅ ลบข้อมูลเรียบร้อยแล้ว!");
      
      // ตรวจสอบข้อมูลหลังลบ
      console.log("\n📊 ตรวจสอบข้อมูลหลังลบ:");
      
      const studentCountAfter = await db.collection("students").countDocuments();
      console.log(`👥 Students: ${studentCountAfter}`);
      
      const problemCountAfter = await db.collection("problems").countDocuments();
      console.log(`📋 Problems: ${problemCountAfter}`);
      
      const referralCountAfter = await db.collection("referrals").countDocuments();
      console.log(`📤 Referrals: ${referralCountAfter}`);
      
    } else {
      console.log("❌ ไม่พบข้อมูลนักเรียน");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testDelete();
