const assert = require('node:assert/strict');
const { test } = require('node:test');
const taskEvents = require('./task-events');

test('task-created notifications run asynchronously and include task details', async () => {
    const originalLog = console.log;
    const messages = [];
    console.log = (message) => messages.push(message);

    try {
        taskEvents.emit('task-created', {
            title: 'Write lab report',
            assignedUser: 'student@example.com'
        });

        assert.equal(messages.length, 0, 'notification should not run during emit');
        await new Promise((resolve) => setImmediate(resolve));

        assert.equal(messages.length, 1);
        assert.match(
            messages[0],
            /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] Notification: task "Write lab report" assigned to student@example\.com$/
        );
    } finally {
        console.log = originalLog;
    }
});
