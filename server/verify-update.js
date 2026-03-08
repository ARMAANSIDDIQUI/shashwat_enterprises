const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const USER_ID = '672b046a22e9624ae58717d7';

const fs = require('fs');
const logFile = 'verify_results.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function verify() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('Starting verification...');
    try {
        await mongoose.connect(MONGO_URI);
        log('Connected to MongoDB');
        const user = await User.findById(USER_ID);
        if (user) {
            log('User found:');
            log(`ID: ${user._id}`);
            log(`Name: ${user.userName}`);
            log(`Email: ${user.email}`);
            log(`Role: ${user.role}`);
        } else {
            log('User not found.');
        }
    } catch (error) {
        log(`Error: ${error.message}`);
    } finally {
        await mongoose.connection.close();
        log('Done.');
    }
}

verify();
