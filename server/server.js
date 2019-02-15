const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const gM = require('./utils/message');
const realS = require('./utils/validation');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  console.log('New user connected');
  
  
  socket.on('join', (params, callback) => {
    if (!realS.isRealString(params.name) || !realS.isRealString(params.room)) {
      callback('Name and room name are required.');
    }
    socket.join(params.room);
    // socket.leave('The Office Fans');

    // io.emit -> io.to('The Office Fans').emit
    // socket.broadcast.emit -> socket.broadcast.to('The Office Fans').emit
    // socket.emit

    socket.emit('newMessage', gM.generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', gM.generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', gM.generateMessage(message.from, message.text));
    callback();
     // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });
  });
  
  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', gM.generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});