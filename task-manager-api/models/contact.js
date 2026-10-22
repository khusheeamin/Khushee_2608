const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [1, 'Name cannot be empty']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

contactSchema.pre('save', function (next) {
    if (this.name && typeof this.name === 'string') this.name = this.name.trim();
    if (this.email && typeof this.email === 'string') this.email = this.email.trim();
    if (this.message && typeof this.message === 'string') this.message = this.message.trim();
    next();
});

module.exports = mongoose.model('Contact', contactSchema);
