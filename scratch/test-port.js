
const net = require('net');

const host = 'ac-17axwb0-shard-00-00.irshjam.mongodb.net';
const port = 27017;

console.log(`Checking connection to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
  console.log('Successfully connected to MongoDB node!');
  socket.destroy();
});

socket.on('timeout', () => {
  console.error('Connection timed out');
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('Connection error:', err.message);
});

socket.connect(port, host);
