const http = require('http');
const url  = require('url');
const express = require('express');
const socket = require('socket.io');
const mysql = require('mysql');
const { query } = require('express');

app = express();
server = http.Server(app);

const io = socket(server);

app.set('views', './views')


app.use(express.static(__dirname + '/public'));

users = {}



io.on('connection', (socket) => {
    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name)
        console.log(`a user(${socket.id}) - ${name} connected`);
        loadMessages(socket, 1);
        que = `SELECT * FROM users WHERE name = "${name}"`
        con.query(que, function(err, result) {
            if(err) throw err;
            if(result.length <= 0) {
                que = `INSERT INTO users (name) VALUES ("${name}")`
                con.query(que, function(err, result) {
                    if(err) throw err;
                })
                console.log(name + " added to sql")
            }
        })
        
    })  
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} disconnected`);
        delete users[socket.id];
    });
    socket.on('send-chat-message', message => {
        socket.emit('add-message', {message: message, name: users[socket.id]});
        addMessage(message, users[socket.id])
    })
})

server.listen(5000, () => {
    console.log('listening on port 5000');
})


function addMessage(message, name) {
    var room = 1
    que = `INSERT INTO chat_line (room_id, user_name, line_text) VALUES (${room}, "${name}", "${message}")`;
    sql(que);
}

function loadMessages(socket, room) {
    que = `SELECT * FROM chat_line WHERE room_id = ${room} ORDER BY time_created ASC`
    con.query(que, function(err, result) {
        for(row of result) {
            socket.emit('add-message', {message: row.line_text, name: row.user_name})
        }
    })
}


function sql(que) {
    con.query(que, function(err, result) {
        if(err) throw err;
        return result;
    })
}

var con = mysql.createConnection({
    host: "localhost",
    user: "ding",
    password: "sql",
    database: "chatroom",
})

con.connect(function(err) {
    if(err) throw err;
    console.log(`mysql connected`)
})



// app = express();
// app.use(express.static(__dirname + '/public'));
// app.listen(8080);

// io.on('connection', (socket)=>{
//     console.log('a user connected');
// })
