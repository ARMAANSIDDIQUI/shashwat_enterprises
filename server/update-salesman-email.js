const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path as needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const USER_ID = '672b046a22e9624ae58717d7';
const NEW_EMAIL = 'anuragpal07015@gmail.com';

console.log('Script started...');

async function updateSalesmanEmail() {
    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        console.log(`Updating user ${USER_ID} with email ${NEW_EMAIL}...`);
        const updatedUser = await User.findByIdAndUpdate(
            USER_ID,
            { email: NEW_EMAIL },
            { new: true }
        );

        if (updatedUser) {
            console.log('User updated successfully:');
            console.log(JSON.stringify(updatedUser, null, 2));
        } else {
            console.log('User not found with ID:', USER_ID);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
        // Keep the process alive for a second to ensure logs are flushed
        setTimeout(() => {
            console.log('Script finished.');
            process.exit(0);
        }, 1000);
    }
}

updateSalesmanEmail();
