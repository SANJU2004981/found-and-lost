const http = require('http');

const postData = JSON.stringify({
    item_id: "550e8400-e29b-41d4-a716-446655440000",
    sender_id: "550e8400-e29b-41d4-a716-446655440001",
    receiver_id: "550e8400-e29b-41d4-a716-446655440002",
    message_text: "Test message to check server stability!"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
