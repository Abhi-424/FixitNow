const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Booking = require('./src/models/Booking');
const Service = require('./src/models/Service');
const User = require('./src/models/User');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fixitnow');
    console.log('✅ Connected to MongoDB');

    // 1. Ensure Services Exist
    const services = [
      { name: 'Plumbing Repair', description: 'Fix leaks, install fixtures, repair pipes', category: 'Plumbing', basePrice: 80 },
      { name: 'AC Servicing', description: 'Air conditioner maintenance and repair', category: 'AC Repair', basePrice: 120 },
      { name: 'Home Cleaning', description: 'Professional house cleaning service', category: 'Cleaning', basePrice: 60 },
      { name: 'Electrical Work', description: 'Wiring, outlets, circuit repairs', category: 'Electrical', basePrice: 100 },
      { name: 'Painting Service', description: 'Interior and exterior painting', category: 'Painting', basePrice: 150 }
    ];

    // Clear and Re-seed Services (to ensure consistent catalog)
    await Service.deleteMany({});
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // 2. Ensure Users Exist
    let users = await User.find({ role: 'user' });
    if (users.length < 2) {
        console.log('Creating sample users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUsers = [
            { username: 'John Doe', email: 'john@example.com', password: hashedPassword, role: 'user', location: 'New York', status: 'Active' },
            { username: 'Jane Smith', email: 'jane@example.com', password: hashedPassword, role: 'user', location: 'Los Angeles', status: 'Active' }
        ];
        
        // Upsert users (create if not exists based on email)
        for (const u of newUsers) {
            let existing = await User.findOne({ email: u.email });
            if (!existing) {
                await User.create(u);
            }
        }
        users = await User.find({ role: 'user' });
    }

    // 3. Ensure Providers Exist
    let providers = await User.find({ role: 'provider' });
    if (providers.length < 2) {
        console.log('Creating sample providers...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newProviders = [
            { username: 'Mike Fixit', email: 'mike@provider.com', password: hashedPassword, role: 'provider', location: 'Brooklyn', status: 'Verified' },
            { username: 'Sarah Spark', email: 'sarah@provider.com', password: hashedPassword, role: 'provider', location: 'Queens', status: 'Pending' }
        ];

        for (const p of newProviders) {
            let existing = await User.findOne({ email: p.email });
            if (!existing) {
                await User.create(p);
            }
        }
        providers = await User.find({ role: 'provider' });
    }
    
    console.log(`Found/Created ${users.length} users and ${providers.length} providers`);

    // 4. Create Sample Bookings
    const sampleBookings = [
      {
        user: users[0]._id,
        provider: providers.length > 0 ? providers[0]._id : null,
        service: 'Plumbing Repair',
        description: 'Kitchen sink is leaking',
        location: '123 Main St, Apt 4B',
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (Completed)
        status: 'Completed',
        amount: 80,
        technicianCompleted: true,
        userConfirmed: true
      },
      {
        user: users[0]._id,
        provider: providers.length > 0 ? providers[0]._id : null,
        service: 'AC Servicing',
        description: 'AC not cooling properly',
        location: '123 Main St, Apt 4B',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow (In Progress/Accepted)
        status: 'In Progress',
        amount: 120
      },
      {
        user: users.length > 1 ? users[1]._id : users[0]._id,
        service: 'Home Cleaning',
        description: 'Deep cleaning needed before party',
        location: '456 Oak Ave',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'Pending',
        amount: 60
      },
       {
        user: users.length > 1 ? users[1]._id : users[0]._id,
        provider: providers.length > 1 ? providers[1]._id : providers[0]._id,
        service: 'Electrical Work',
        description: 'Outlet sparking',
        location: '456 Oak Ave',
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'Waiting for Confirmation',
        amount: 100,
        technicianCompleted: true
      }
    ];

    // Clear existing bookings to avoid duplicates/confusion
    await Booking.deleteMany({});
    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Created ${createdBookings.length} sample bookings`);

    console.log('\n📊 Database seeded successfully!');
    console.log(`   - Services: ${createdServices.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Providers: ${providers.length}`);
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
