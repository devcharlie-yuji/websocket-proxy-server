// Updated proxy.js with text conversion
const WebSocket = require('ws');
const https = require('https');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket proxy server started on ws://localhost:8080');

// Handle connections from browsers
wss.on('connection', function connection(ws) {
    console.log('Browser connected to proxy');

    // Connect to the backend WebSocket server
    const backendWs = new WebSocket('wss://106.51.158.49:7777/api/v1/ws/events', {
        rejectUnauthorized: false, // Ignore SSL certificate validation
        agent: new https.Agent({
            rejectUnauthorized: false // Also needed for HTTPS agent
        })
    });

    // When connected to backend
    backendWs.on('open', function open() {
        console.log('Proxy connected to backend WebSocket');

        // Forward messages from browser to backend
        ws.on('message', function incoming(message) {
            console.log('Forwarding message to backend');
            backendWs.send(message);
        });

        // Forward messages from backend to browser - ensure it's sent as text
        backendWs.on('message', function incoming(message) {
            console.log('Received message from backend');

            // Convert to string if it's a Buffer
            if (Buffer.isBuffer(message)) {
                console.log('Converting Buffer to string');
                message = message.toString('utf8');
            }

            // Log a sample of the message for debugging
            console.log('Sample of message:', message.toString().substring(0, 100) + '...');

            // Send to browser as text
            ws.send(message.toString());
        });
    });

    // Handle backend connection errors
    backendWs.on('error', function error(err) {
        console.error('Backend connection error:', err);
        ws.close(1011, 'Error connecting to backend: ' + err.message);
    });

    // Clean up when browser disconnects
    ws.on('close', function close() {
        console.log('Browser disconnected');
        backendWs.close();
    });

    // Handle connection errors
    ws.on('error', function error(err) {
        console.error('Browser connection error:', err);
    });
});

// Handle process errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

// const WebSocket = require('ws');
// const https = require('https');

// // Create a WebSocket server
// const wss = new WebSocket.Server({ port: 8080 });
// console.log('WebSocket proxy server started on ws://localhost:8080');

// // Handle connections from browsers
// wss.on('connection', function connection(ws) {
//     console.log('Browser connected to proxy');

//     // Connect to the backend WebSocket server
//     const backendWs = new WebSocket('wss://106.51.158.49:7777/api/v1/ws/events', {
//         rejectUnauthorized: false, // Ignore SSL certificate validation
//         agent: new https.Agent({
//             rejectUnauthorized: false // Also needed for HTTPS agent
//         })
//     });

//     // When connected to backend
//     backendWs.on('open', function open() {
//         console.log('Proxy connected to backend WebSocket');

//         // Forward messages from browser to backend
//         ws.on('message', function incoming(message) {
//             backendWs.send(message);
//         });

//         // Forward messages from backend to browser
//         backendWs.on('message', function incoming(message) {
//             ws.send(message);
//         });
//     });

//     // Handle backend connection errors
//     backendWs.on('error', function error(err) {
//         console.error('Backend connection error:', err);
//     });

//     // Clean up when browser disconnects
//     ws.on('close', function close() {
//         console.log('Browser disconnected');
//         backendWs.close();
//     });
// });