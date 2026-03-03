// Quick test script to verify backend works
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

console.log('=== Backend Test ===');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('');

// Test MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.name);
  
  // Start the actual server
  console.log('');
  console.log('Starting Express server...');
  require('./server.js');
}).catch((err) => {
  console.error('❌ MongoDB Connection Failed:', err.message);
  process.exit(1);
});
