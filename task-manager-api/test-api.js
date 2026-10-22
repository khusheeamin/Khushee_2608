const { app, connectDB } = require('./server');
const mongoose = require('mongoose');

async function runChecks() {
    await connectDB();

    const server = app.listen(0);
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const credentials = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
    };

    let response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (response.status !== 201) {
        console.error('FAILED POST /register');
        server.close();
        process.exit(1);
    }

    response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const login = await response.json();
    if (response.status !== 200 || !login.data?.token) {
        console.error('FAILED POST /login');
        server.close();
        process.exit(1);
    }
    const authHeaders = { Authorization: `Bearer ${login.data.token}` };

    // basic GET
    response = await fetch(`${baseUrl}/tasks`, { headers: authHeaders });
    if (response.status !== 200) {
        console.error('FAILED GET /tasks');
        server.close();
        process.exit(1);
    }

    // create a task
    response = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ title: 'Write lab report' })
    });

    if (response.status !== 201) {
        console.error('FAILED POST /tasks');
        server.close();
        process.exit(1);
    }

    const created = await response.json();
    const id = created.data && created.data._id;

    if (!id) {
        console.error('POST /tasks did not return id');
        server.close();
        process.exit(1);
    }

    // update the task
    response = await fetch(`${baseUrl}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ completed: true })
    });

    if (response.status !== 200) {
        console.error('FAILED PUT /tasks/:id');
        server.close();
        process.exit(1);
    }

    // delete the task
    response = await fetch(`${baseUrl}/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders
    });

    if (response.status !== 200) {
        console.error('FAILED DELETE /tasks/:id');
        server.close();
        process.exit(1);
    }

    // missing route
    response = await fetch(`${baseUrl}/missing`);
    if (response.status !== 404) {
        console.error('FAILED GET /missing');
        server.close();
        process.exit(1);
    }

    const missingContentTypeResponse = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: authHeaders
    });

    if (missingContentTypeResponse.status !== 415) {
        console.error(`FAILED POST /tasks without Content-Type: expected 415, received ${missingContentTypeResponse.status}`);
        server.close();
        process.exit(1);
    }

    console.log('All API checks passed.');
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    await mongoose.disconnect();
}

runChecks().catch((error) => {
    console.error(error);
    process.exit(1);
});