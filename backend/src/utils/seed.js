require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Ship = require('../models/Ship');
const User = require('../models/User');
const MaintenanceTask = require('../models/MaintenanceTask');
const SafetyDrill = require('../models/SafetyDrill');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await Ship.deleteMany();
  await User.deleteMany();
  await MaintenanceTask.deleteMany();
  await SafetyDrill.deleteMany();

  // Ships
  const ships = await Ship.insertMany([
    { name: 'MV Neptune Star', imoNumber: 'IMO1234567', type: 'Cargo', flag: 'Panama', status: 'Active' },
    { name: 'SS Ocean Voyager', imoNumber: 'IMO7654321', type: 'Tanker', flag: 'Liberia', status: 'Docked' },
    { name: 'MV Pacific Glory', imoNumber: 'IMO2345678', type: 'Container', flag: 'Marshall Islands', status: 'Active' },
  ]);

  // All users — use insertMany to bypass pre-save hook (passwords pre-hashed manually)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const crewPassword = await bcrypt.hash('crew123', 10);

  const allUsers = await User.insertMany([
    { name: 'Admin User', email: 'admin@fathommarine.com', password: adminPassword, role: 'admin', rank: 'Fleet Manager' },
    { name: 'John Martinez', email: 'john@fathommarine.com', password: crewPassword, role: 'crew', shipId: ships[0]._id, rank: 'Chief Engineer' },
    { name: 'Sarah Kim', email: 'sarah@fathommarine.com', password: crewPassword, role: 'crew', shipId: ships[0]._id, rank: 'Second Officer' },
    { name: 'Carlos Reyes', email: 'carlos@fathommarine.com', password: crewPassword, role: 'crew', shipId: ships[1]._id, rank: 'Chief Mate' },
    { name: 'Emma Wilson', email: 'emma@fathommarine.com', password: crewPassword, role: 'crew', shipId: ships[2]._id, rank: 'Bosun' },
  ]);

  const crew = allUsers.slice(1);

  const now = new Date();
  const past = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
  const future = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // Maintenance Tasks
  await MaintenanceTask.insertMany([
    { title: 'Engine Room Inspection', description: 'Full inspection of main engine components', shipId: ships[0]._id, assignedTo: crew[0]._id, status: 'Completed', priority: 'High', dueDate: past(5), completedAt: past(6) },
    { title: 'Hull Cleaning', description: 'Remove barnacles and inspect hull integrity', shipId: ships[0]._id, assignedTo: crew[1]._id, status: 'In Progress', priority: 'Medium', dueDate: future(3) },
    { title: 'Fire Suppression Check', description: 'Test all fire suppression systems', shipId: ships[0]._id, assignedTo: crew[0]._id, status: 'Pending', priority: 'High', dueDate: past(2) },
    { title: 'Navigation Equipment Check', description: 'Calibrate GPS and radar systems', shipId: ships[1]._id, assignedTo: crew[2]._id, status: 'Completed', priority: 'High', dueDate: past(10), completedAt: past(11) },
    { title: 'Bilge Pump Maintenance', description: 'Service all bilge pumps', shipId: ships[1]._id, assignedTo: crew[2]._id, status: 'Pending', priority: 'Medium', dueDate: past(1) },
    { title: 'Anchor Chain Inspection', description: 'Inspect and lubricate anchor chain', shipId: ships[2]._id, assignedTo: crew[3]._id, status: 'Pending', priority: 'Low', dueDate: future(7) },
    { title: 'Lifeboat Davit Service', description: 'Service lifeboat launching mechanisms', shipId: ships[2]._id, assignedTo: crew[3]._id, status: 'Completed', priority: 'High', dueDate: past(3), completedAt: past(4) },
    { title: 'Fuel System Inspection', description: 'Check fuel lines and tank integrity', shipId: ships[0]._id, assignedTo: crew[0]._id, status: 'Pending', priority: 'High', dueDate: future(2) },
  ]);

  // Safety Drills
  await SafetyDrill.insertMany([
    {
      title: 'Monthly Fire Drill - Neptune Star', type: 'Fire Drill', shipId: ships[0]._id,
      scheduledDate: past(3), status: 'Completed', completedAt: past(3),
      participants: [
        { userId: crew[0]._id, attended: true, completedAt: past(3) },
        { userId: crew[1]._id, attended: true, completedAt: past(3) }
      ]
    },
    {
      title: 'Abandon Ship Drill - Neptune Star', type: 'Evacuation Drill', shipId: ships[0]._id,
      scheduledDate: past(10), status: 'Missed',
      participants: [
        { userId: crew[0]._id, attended: false },
        { userId: crew[1]._id, attended: false }
      ]
    },
    {
      title: 'Man Overboard Drill - Ocean Voyager', type: 'Man Overboard', shipId: ships[1]._id,
      scheduledDate: future(2), status: 'Scheduled',
      participants: [{ userId: crew[2]._id, attended: false }]
    },
    {
      title: 'Oil Spill Response - Pacific Glory', type: 'Oil Spill', shipId: ships[2]._id,
      scheduledDate: future(5), status: 'Scheduled',
      participants: [{ userId: crew[3]._id, attended: false }]
    },
    {
      title: 'Medical Emergency Drill - Ocean Voyager', type: 'Medical Emergency', shipId: ships[1]._id,
      scheduledDate: past(7), status: 'Completed', completedAt: past(7),
      participants: [{ userId: crew[2]._id, attended: true, completedAt: past(7) }]
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('   Admin:  admin@fathommarine.com  / admin123');
  console.log('   Crew 1: john@fathommarine.com   / crew123');
  console.log('   Crew 2: sarah@fathommarine.com  / crew123');
  console.log('   Crew 3: carlos@fathommarine.com / crew123');
  console.log('   Crew 4: emma@fathommarine.com   / crew123');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
