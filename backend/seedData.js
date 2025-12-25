const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const Service = require('./src/models/Service');
const User = require('./src/models/User');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('✅ Connected to MongoDB');

    // Find existing users
    const users = await User.find({ role: 'user' }).limit(2);
    const providers = await User.find({ role: 'provider' }).limit(2);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please register some users first.');
      return;
    }
    
    console.log(`Found ${users.length} users and ${providers.length} providers`);

    // Create sample services
    const services = [
      { name: 'Plumbing Repair', description: 'Fix leaks, install fixtures, repair pipes', category: 'Plumbing', basePrice: 80 },
      { name: 'AC Servicing', description: 'Air conditioner maintenance and repair', category: 'AC Repair', basePrice: 120 },
      { name: 'Home Cleaning', description: 'Professional house cleaning service', category: 'Cleaning', basePrice: 60 },
      { name: 'Electrical Work', description: 'Wiring, outlets, circuit repairs', category: 'Electrical', basePrice: 100 },
      { name: 'Painting Service', description: 'Interior and exterior painting', category: 'Painting', basePrice: 150 }
    ];

    // Clear existing services
    await Service.deleteMany({});
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // Create sample bookings for the first user
    const sampleBookings = [
      {
        user: users[0]._id,
        provider: providers.length > 0 ? providers[0]._id : null,
        service: 'Plumbing Repair',
        description: 'Kitchen sink is leaking',
        location: '123 Main St, Apt 4B',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'Completed',
        amount: 80
      },
      {
        user: users[0]._id,
        provider: providers.length > 0 ? providers[0]._id : null,
        service: 'AC Servicing',
        description: 'AC not cooling properly',
        location: '123 Main St, Apt 4B',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'In Progress',
        amount: 120
      },
      {
        user: users[0]._id,
        service: 'Home Cleaning',
        description: 'Deep cleaning needed',
        location: '123 Main St, Apt 4B',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'Pending',
        amount: 60
      }
    ];

    // Create additional bookings if there's a second user
    if (users.length > 1) {
      sampleBookings.push({
        user: users[1]._id,
        service: 'Electrical Work',
        description: 'Install new outlet',
        location: '456 Oak Ave',
        scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        amount: 100
      });
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Created ${createdBookings.length} sample bookings`);

    console.log('\n📊 Database seeded successfully!');
    console.log(`   - Services: ${createdServices.length}`);
    console.log(`   - Bookings: ${createdBookings.length}`);
    console.log('\n✨ You can now test the dashboards with real data!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedData();
