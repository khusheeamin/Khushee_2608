const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        minlength: [1, 'Task title cannot be empty']
    },
    description: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Priority enum
taskSchema.add({
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
});

// pre-save hook to trim whitespace from title
taskSchema.pre('save', function (next) {
    if (this.title && typeof this.title === 'string') {
        this.title = this.title.trim();
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);
