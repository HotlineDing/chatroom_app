const http = require('http');
const url  = require('url');
const express = require('express');
const socket = require('socket.io');
const sql = require('./utils/sql');
// const events = require('./utils/sql.events')
const formatMessage = require('./utils/messages');
const { debugPort } = require('process');
// import events from './utils/sql'

app = express();
server = http.Server(app);

const io = socket(server);

app.use(express.static(__dirname + '/public'));

server.listen(5000, () => {
    console.log('listening on port 5000');
})

users = {}
rooms = {}

let db = new sql.SQL_database();


io.on('connection', (socket) => {
    socket.on('userJoinRoom', ({username, room}) => {
        socket.join(room)
        users[socket.id] = username
        rooms[socket.id] = room
  

        let params = {user: username, room: room, socket_id: socket.id}

        let events = sql.events
        
        db.update(events.user_login, params).then(
        db.update(events.user_join_room, params)).then(
        db.update(events.user_login, params, (result) => {
            for(var i=0; i<result.length; i++) {
                message = formatMessage(result[i].user_name, result[i].line_text)
                message.time = result[i].time_created
                socket.emit('new-message', message)
           }
        })).then(

        db.update(events.user_socket, params).then().catch(error)).then(
        db.update(events.get_user_list, params, (result) => {
            let users = []
            for(var i=0; i<result.length; i++) {
                users.push(result[i].user)
            }
            io.to(room).emit('update-user-list', users)
        })).then(

        db.update(events.load_messages, params, (result) => {
            for(var i=0; i<result.length; i++) {
                message = formatMessage(result[i].user_name, result[i].line_text)
                message.time = result[i].time_created
                socket.emit('new-message', message)
            }
        }))

        setTimeout(() => io.to(room).emit('userRoomChange', username, 'enter'), 100)
        // setTimeout(() => console.log('hello'), 2000)
        

    })
    socket.on('send-message', message => {
        let params = {user: message.user, message: message.message, room: message.room}

        io.to(message.room).emit('new-message', formatMessage(message.user, message.message))
        db.update('insert_message', params).then().catch(error)
    })
    socket.on('disconnect', () => {
        let params = {user: users[socket.id], room: rooms[socket.id]}

        const user = users[socket.id]
        const room = rooms[socket.id]
        delete users[socket.id]
        delete rooms[socket.id]

        db.update('user_leave_room', params).then().catch(error)
        db.update('rm_user_socket', params).then().catch(error)
        db.update('get_user_list', params, (result) => {
            let users = []
            for(var i=0; i<result.length; i++) {
                users.push(result[i].user)
            }
            io.to(room).emit('update-user-list', users)
        }).then().catch(error)

        io.to(room).emit('userRoomChange', user, 'leave')
        
    })
})


function error(error) {
    console.log(error)
}