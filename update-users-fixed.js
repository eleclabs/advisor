const mongoose = require('mongoose');

async function updateUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/advisor');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update Admin user
    await db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a78' },
      { $set: { gender: 'male', birthDate: new Date('1990-01-15') } }
    );
    console.log('Updated Admin');
    
    // Update Teacher user
    await db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a79' },
      { $set: { gender: 'male', birthDate: new Date('1985-05-20') } }
    );
    console.log('Updated Teacher');
    
    // Update Executive user
    await db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a7a' },
      { $set: { gender: 'male', birthDate: new Date('1980-03-10') } }
    );
    console.log('Updated Executive');
    
    // Update Committee user
    await db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a7b' },
      { $set: { gender: 'female', birthDate: new Date('1988-12-05') } }
    );
    console.log('Updated Committee');
    
    console.log('✅ Updated all users');
    
    // Verify updates
    const users = await db.collection('users').find({}).toArray();
    console.log('Updated users:');
    users.forEach(user => {
      console.log(`  ${user.first_name}: gender=${user.gender}, birthDate=${user.birthDate}`);
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateUsers();
