const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cache = require('./cache');
const Task = require('./models/task');
const Contact = require('./models/contact');
const User = require('./models/user');
const auth = require('./middleware/auth');
const taskEvents = require('./task-events');

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use(express.json());
app.use(cors());

const validateJsonContent = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.is('application/json')) {
            return res.status(415).json({
                success: false,
                error: 'Content-Type must be application/json'
            });
        }
    }
    next();
};

app.use('/tasks', auth, validateJsonContent);
app.use('/contacts', validateJsonContent);

const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid id' });
    }
    next();
};

const validateCredentials = (req, res, next) => {
    const { email, password } = req.body || {};
    const errors = {};
    if (typeof email !== 'string' || !email.trim()) errors.email = 'Email is required';
    if (typeof password !== 'string' || password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });
    next();
};

const validateTask = (req, res, next) => {
    if (req.method === 'POST' && (typeof req.body?.title !== 'string' || !req.body.title.trim())) {
        return res.status(400).json({ success: false, errors: { title: 'Task title is required' } });
    }
    next();
};

app.post('/register', validateCredentials, async (req, res, next) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ success: false, error: 'Email is already registered' });

        const password = await bcrypt.hash(req.body.password, 12);
        const user = await User.create({ email, password });
        res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ success: false, error: 'Invalid registration details' });
        next(err);
    }
});

app.post('/login', validateCredentials, async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'development-secret-change-me', { expiresIn: '1h' });
        res.status(200).json({ success: true, data: { token } });
    } catch (err) {
        next(err);
    }
});

app.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

app.get('/tasks', async (req, res, next) => {
    try {
        const cachedTasks = cache.get('all_tasks');

        if (cachedTasks) {
            console.log('CACHE HIT - Returning cached tasks');
            return res.status(200).json({ success: true, data: cachedTasks });
        }

        console.log('CACHE MISS - Fetching tasks from MongoDB');

        const tasks = await Task.find().sort({ createdAt: -1 });
        cache.set('all_tasks', tasks);

        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        next(err);
    }
});

app.get('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
});

app.post('/tasks', validateTask, async (req, res, next) => {
    try {
        const payload = req.body;
        const task = new Task(payload);
        await task.validate();
        const saved = await task.save();
        cache.del('all_tasks');
        console.log('CACHE INVALIDATED - Tasks changed');
        res.once('finish', () => {
            console.log(`[${new Date().toISOString()}] API response sent: POST /tasks (201)`);
            taskEvents.emit('task-created', {
                title: saved.title,
                assignedUser: req.user.email || req.user.id
            });
        });
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const [field, errorObj] of Object.entries(err.errors || {})) {
                errors[field] = errorObj.message;
            }
            return res.status(400).json({ success: false, errors });
        }
        next(err);
    }
});

app.put('/tasks/:id', validateTask, validateObjectId, async (req, res, next) => {
    try {
        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updated) return res.status(404).json({ success: false, error: 'Task not found' });
        cache.del('all_tasks');
        console.log('CACHE INVALIDATED - Tasks changed');
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const [field, errorObj] of Object.entries(err.errors || {})) {
                errors[field] = errorObj.message;
            }
            return res.status(400).json({ success: false, errors });
        }
        next(err);
    }
});

app.delete('/tasks/:id', validateObjectId, async (req, res, next) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
        cache.del('all_tasks');
        console.log('CACHE INVALIDATED - Tasks changed');
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Contacts endpoints
app.get('/contacts', async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (err) {
        next(err);
    }
});

app.get('/contacts/:id', validateObjectId, async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        next(err);
    }
});

app.post('/contacts', async (req, res, next) => {
    try {
        const payload = req.body;
        console.log('POST /contacts payload:', payload);
        const contact = new Contact(payload);
        await contact.validate();
        const saved = await contact.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const [field, errorObj] of Object.entries(err.errors || {})) {
                errors[field] = errorObj.message;
            }
            return res.status(400).json({ success: false, errors });
        }
        next(err);
    }
});

app.put('/contacts/:id', validateObjectId, async (req, res, next) => {
    try {
        const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ success: false, error: 'Contact not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const [field, errorObj] of Object.entries(err.errors || {})) errors[field] = errorObj.message;
            return res.status(400).json({ success: false, errors });
        }
        next(err);
    }
});

app.delete('/contacts/:id', validateObjectId, async (req, res, next) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Contact not found' });
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Duplicate API under /api to avoid any unexpected routing issues
app.get('/api/contacts', async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contacts });
    } catch (err) {
        next(err);
    }
});

app.post('/api/contacts', async (req, res, next) => {
    try {
        const payload = req.body;
        console.log('POST /api/contacts payload:', payload);
        const contact = new Contact(payload);
        await contact.validate();
        const saved = await contact.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};
            for (const [field, errorObj] of Object.entries(err.errors || {})) {
                errors[field] = errorObj.message;
            }
            return res.status(400).json({ success: false, errors });
        }
        next(err);
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong'
    });
});

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-manager';
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
};

if (require.main === module) {
    connectDB()
        .then(() => {
            const server = app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                // list registered routes for debugging (guard in case router is not available)
                try {
                    const routes = [];
                    if (app._router && app._router.stack && Array.isArray(app._router.stack)) {
                        app._router.stack.forEach((r) => {
                            if (r.route && r.route.path) {
                                const methods = Object.keys(r.route.methods).join(',').toUpperCase();
                                routes.push(`${methods} ${r.route.path}`);
                            }
                        });
                    }
                    console.log('Registered routes:\n' + routes.join('\n'));
                } catch (e) {
                    console.error('Failed to list routes', e);
                }
            });
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1);
        });
}

module.exports = { app, connectDB };
