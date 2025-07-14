const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: Object,
        required: true,
        validate: {
            validator: function(v) {
                return v && v.protocol && v.hostname;
            },
            message: 'Original URL must be a valid parsed URL object with protocol and hostname'
        }
    },
    shortcode: { type: String, required: true, unique: true },
    expiry: { type: Date, required: true },
    clickData: [{
        timestamp: { type: Date, required: true },
        source: { type: String, required: true },
        location: { type: String, required: true }
    }]
});

module.exports = mongoose.model('Url', urlSchema);