const mongoose = require('mongoose');

async function updateUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/advisor');
    console.log('Connected to MongoDB');
    
    // Update Admin user
    await mongoose.connection.db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a78' },
      { 
        $set: { 
          gender: 'male',
          birthDate: new Date('1990-01-15')
        }
      }
    );
    
    // Update Teacher user
    await mongoose.connection.db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a79' },
      { 
        $set: { 
          gender: 'male',
          birthDate: new Date('1985-05-20')
        }
      }
    );
    
    // Update Executive user
    await mongoose.connection.db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a7a' },
      { 
        $set: { 
          gender: 'male',
          birthDate: new Date('1980-03-10')
        }
      }
    );
    
    // Update Committee user
    await mongoose.connection.db.collection('users').updateOne(
      { _id: '69b0ef60e5c41efd57b48a7b' },
      { 
        $set: { 
          gender: 'female',
          birthDate: new Date('1988-12-05')
        }
      }
    );
    
    console.log('✅ Updated all users with gender and birthDate');
    
    // Verify updates
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
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
