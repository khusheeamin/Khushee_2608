const { EventEmitter } = require('node:events');

const taskEvents = new EventEmitter();

taskEvents.on('task-created', (taskData) => {
    setImmediate(() => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Notification: task "${taskData.title}" assigned to ${taskData.assignedUser}`);
    });
});

module.exports = taskEvents;
