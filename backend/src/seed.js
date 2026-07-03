const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Department = require('./models/Department');
const Supervisor = require('./models/Supervisor');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Supervisor.deleteMany({});

    // 1. Create departments
    const departments = await Department.insertMany([
      { name: 'Water Services', code: 'WAT', description: 'Water supply and sanitation services', headOfDepartment: 'Eng. James Opiyo' },
      { name: 'Energy', code: 'ENR', description: 'Energy development and management', headOfDepartment: 'Eng. Mary Chebet' },
      { name: 'Environment', code: 'ENV', description: 'Environmental conservation and management', headOfDepartment: 'Dr. Paul Mburu' },
      { name: 'Natural Resources', code: 'NAT', description: 'Natural resources management', headOfDepartment: 'Dr. Grace Kemunto' },
      { name: 'Administration', code: 'ADM', description: 'Department administration and finance', headOfDepartment: 'Catherine Wanjiku' },
    ]);
    console.log(`Created ${departments.length} departments`);

    // 2. Create all user accounts with different roles
    await User.create({ name: 'System Administrator', email: 'admin@kisiiwater.go.ke', password: 'Admin123!', role: 'admin', phone: '+254700100200', department: 'Administration', designation: 'ICT Administrator' });
    await User.create({ name: 'Catherine Wanjiku', email: 'hr@kisiiwater.go.ke', password: 'Hr123!', role: 'hr', phone: '+254700100201', department: 'Administration', designation: 'HR Manager' });
    await User.create({ name: 'Eng. James Opiyo', email: 'director@kisiiwater.go.ke', password: 'Director123!', role: 'director', phone: '+254700100202', department: 'Administration', designation: 'Director of Water Services' });
    
    // Supervisor login accounts
    await User.create({ name: 'John Mwangi', email: 'jmwangi@kisiiwater.go.ke', password: 'Supervisor123!', role: 'supervisor', phone: '+254711111111', department: 'Water Services', designation: 'Senior Water Engineer' });
    await User.create({ name: 'Sarah Wanjiku', email: 'swanjiku@kisiiwater.go.ke', password: 'Supervisor123!', role: 'supervisor', phone: '+254722222222', department: 'Environment', designation: 'Environmental Officer' });
    await User.create({ name: 'David Ochieng', email: 'dochieng@kisiiwater.go.ke', password: 'Supervisor123!', role: 'supervisor', phone: '+254733333333', department: 'Energy', designation: 'Energy Officer' });
    await User.create({ name: 'Grace Akinyi', email: 'gakinyi@kisiiwater.go.ke', password: 'Supervisor123!', role: 'supervisor', phone: '+254744444444', department: 'Natural Resources', designation: 'Geologist' });
    await User.create({ name: 'Peter Kamau', email: 'pkamau@kisiiwater.go.ke', password: 'Supervisor123!', role: 'supervisor', phone: '+254755555555', department: 'Administration', designation: 'HR Officer' });
    
    console.log('Created 8 user accounts');

    // 3. Create supervisor profiles (separate from login accounts)
    await Supervisor.insertMany([
      { name: 'John Mwangi', email: 'jmwangi@kisiiwater.go.ke', phone: '+254711111111', department: 'Water Services', designation: 'Senior Water Engineer', specialization: 'Water Supply', maxAttachees: 5 },
      { name: 'Sarah Wanjiku', email: 'swanjiku@kisiiwater.go.ke', phone: '+254722222222', department: 'Environment', designation: 'Environmental Officer', specialization: 'Environmental Impact Assessment', maxAttachees: 4 },
      { name: 'David Ochieng', email: 'dochieng@kisiiwater.go.ke', phone: '+254733333333', department: 'Energy', designation: 'Energy Officer', specialization: 'Renewable Energy', maxAttachees: 3 },
      { name: 'Grace Akinyi', email: 'gakinyi@kisiiwater.go.ke', phone: '+254744444444', department: 'Natural Resources', designation: 'Geologist', specialization: 'Mining and Geology', maxAttachees: 3 },
      { name: 'Peter Kamau', email: 'pkamau@kisiiwater.go.ke', phone: '+254755555555', department: 'Administration', designation: 'HR Officer', specialization: 'Human Resources', maxAttachees: 5 },
    ]);
    console.log('Created 5 supervisors');

    console.log('\n============================================');
    console.log('  SEED DATA CREATED SUCCESSFULLY!');
    console.log('============================================');
    console.log('  Admin:     admin@kisiiwater.go.ke / Admin123!');
    console.log('  HR:        hr@kisiiwater.go.ke / Hr123!');
    console.log('  Director:  director@kisiiwater.go.ke / Director123!');
    console.log('  Supervisor (all):  supervisor@kisiiwater.go.ke / Supervisor123!');
    console.log('  Or use individual: jmwangi@kisiiwater.go.ke / Supervisor123!');
    console.log('============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();