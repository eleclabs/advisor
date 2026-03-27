const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/advisor');
    console.log('Connected to MongoDB');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
