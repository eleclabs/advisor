const mongoose = require('mongoose');

async function checkDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/advisor', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
    
    // Check if Student collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Define Student schema inline for testing
    const StudentSchema = new mongoose.Schema({
      id: { type: String },
      first_name: { type: String },
      last_name: { type: String },
      email: { type: String },
    }, { timestamps: true });
    
    const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
    
    const students = await Student.find({});
    console.log('📊 Found students:', students.length);
    
    if (students.length === 0) {
      console.log('🔍 No students found. Creating test student...');
      const testStudent = new Student({
        id: '600',
        first_name: 'Test',
        last_name: 'Student',
        email: '600@student.com',
      });
      await testStudent.save();
      console.log('✅ Test student created');
    } else {
      console.log('👤 First student:', { 
        id: students[0].id, 
        name: students[0].first_name + ' ' + students[0].last_name,
        email: students[0].email
      });
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

checkDB();
