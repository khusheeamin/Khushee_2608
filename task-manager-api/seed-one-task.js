const { connectDB } = require('./server');
const Task = require('./models/task');

async function seed() {
    try {
        await connectDB();

        const existing = await Task.findOne({ title: 'Initial task' });
        if (existing) {
            console.log('Example task already exists:', existing._id);
            process.exit(0);
        }

        const task = new Task({
            title: 'Initial task',
            description: 'This task was added by the seed script',
            priority: 'medium'
        });

        const saved = await task.save();
        console.log('Inserted example task:', saved._id);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed', err);
        process.exit(1);
    }
}

seed();
