const mongoose = require('mongoose');
const logger = getLogger(__filename);

const connect = async (app) => {
    try {

        if (app.get('env') === 'production')
            mongoose.set('debug', true);

        let options = {
            maxPoolSize: 100,
            dbName: process.env.DB_NAME,
            socketTimeoutMS: 45000,
        };
        await mongoose.connect(process.env.MONGODB_URI, options);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = { connect };