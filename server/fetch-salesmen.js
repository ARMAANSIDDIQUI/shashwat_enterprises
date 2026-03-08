const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const fetchSalesmen = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("MONGO_URI not found in .env file. Exiting.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected...");

        const salesmen = await User.find({ role: "salesman" }).select("-password");

        if (salesmen.length === 0) {
            console.log("No salesmen found.");
        } else {
            console.log(`Found ${salesmen.length} salesmen:\n`);
            salesmen.forEach((salesman, index) => {
                console.log(`--- Salesman ${index + 1} ---`);
                console.log(`Name:      ${salesman.userName}`);
                console.log(`Phone NO:  ${salesman.phoneNo}`);
                console.log(`Email:     ${salesman.email || "N/A"}`);
                console.log(`Beat Name: ${salesman.beatName}`);
                console.log(`Created:   ${new Date(salesman.createdAt).toLocaleString()}`);
                console.log("-------------------\n");
            });
        }

    } catch (error) {
        console.error("Error fetching salesmen:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

fetchSalesmen();
