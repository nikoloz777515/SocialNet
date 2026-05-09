const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`DB Connection success`);
    } catch(err) {
        console.error(err);
    }
};

module.exports = connectDB;