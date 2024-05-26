require('dotenv').config();
const mongoose = require('mongoose');
const {User} = require('./model');
const bcrypt = require('bcrypt')

mongoose.connect(process.env.MONGODB_URI);

const seedUsers = { name: 'Admin', email: 'admin@admin.com', password: '12345678' ,role: "admin"};

const seedDB = async () => {
  try {
    await User.deleteMany({});
    console.log('Cleared the User collection');
    seedUsers.password = await bcrypt.hash(seedUsers.password, 12);
    await User.insertMany(seedUsers);
    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
};

seedDB();
