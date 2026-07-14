const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attachee_management';
    const dbName = process.env.MONGO_DB_NAME || 'attachee_management';
    const conn = await mongoose.connect(uri, { dbName });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
