const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/taxsaas';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const seedUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('User test@example.com exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingUser.password = await bcrypt.hash('password123.', salt); // Manually hash
            existingUser.mobile = '9876543210';
            await existingUser.save();
            console.log('Password updated successfully');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123.', salt); // Manually hash
            const newUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                mobile: '9876543210',
                password: hashedPassword
            });

            await newUser.save();
            console.log('Test user created successfully');
        }
        console.log('Email: test@example.com');
        console.log('Password: password123.');
    } catch (err) {
        console.error('Error seeding user:', err);
    } finally {
        await mongoose.disconnect();
    }
};

seedUser();
