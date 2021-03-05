const http = require('http');
const url  = require('url');
const express = require('express');
const socket = require('socket.io');
const sql = require('./utils/sql');
const formatMessage = require('./utils/messages');

app = express();
server = http.Server(app);

const io = socket(server);

app.use(express.static(__dirname + '/public'));

server.listen(5000, () => {
    console.log('listening on port 5000');
})

users = {}


io.on('connection', (socket) => {
    sql.init_sql(socket, io)
    socket.on('userJoinRoom', ({username, room}) => {
        socket.join(room)
        sql.newRoom(room)
        sql.userLogin(username)
        sql.userSocket(socket.id, username)
        sql.userJoinRoom(room, username)
        sql.updateUserList(room)
        sql.loadMessages(room)
        users[socket.id] = username
        io.to(room).emit('userEnterRoom', username)
    })
    socket.on('send-message', message => {
        io.to(message.room).emit('new-message', formatMessage(message.user, message.message))
        sql.insertMessage(message.room, message.user, message.message)
    })
    socket.on('disconnect', () => {
        sql.userLeaveRoom("JavaScript", users[socket.id])
        sql.delUserSocket(socket.id)
        sql.updateUserList("JavaScript")
    })
})





