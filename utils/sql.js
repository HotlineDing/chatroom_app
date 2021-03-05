const mysql = require('mysql')
const formatMessage = require('./messages')

function genQuery(query, params) {
    const queries = {
        'userLogin': `INSERT IGNORE INTO users (name) VALUES ("${params.user}")`,
        'userSocket': `INSERT IGNORE INTO sockets (id, user) VALUES("${params.socket_id}", "${params.user}")`,
        'delUserSocket': `DELETE FROM sockets WHERE id = "${params.socket_id}"`,
        'newRoom': `INSERT IGNORE INTO rooms (room_name) VALUES ("${params.room}")`,
        'userJoinRoom': `INSERT IGNORE INTO user_rooms (room, user, status) VALUES ("${params.room}", "${params.user}", "ACTIVE")`,
        'userLeaveRoom': `DELETE FROM user_rooms WHERE room = "${params.room}" AND user = "${params.user}"`, 
        'insertMessage': `INSERT INTO chat_line (room_name, user_name, line_text) VALUES ("${params.room}", "${params.user}", "${params.message}")`,
        "clearAllMessages": `DELETE FROM chat_line`,
    }
    return queries[query]
}



async function userLogin(user) {
    var ret = execute(genQuery("userLogin", {user: user}))
}

function userSocket(socket_id, user) {
    execute(genQuery("userSocket", {socket_id: socket_id, user:user}))
}

function delUserSocket(socket_id) {
    execute(genQuery("delUserSocket", {socket_id: socket_id}))
}

function newRoom(room) {
    execute(genQuery("newRoom", {room: room}))
}

function userJoinRoom(room , user) {
    execute(genQuery("userJoinRoom", {room: room, user: user}))
}

function userLeaveRoom(room, user) {
    execute(genQuery("userLeaveRoom", {room: room, user: user}))
}

function insertMessage(room, user, message) {
    execute(genQuery("insertMessage", {room:room, user:user, message:message}))
}

function clearAllMessages() {
    execute(genQuery("clearAllMessages", {}))
}

async function updateUserList(room) {
    query =
    `SELECT DISTINCT room, user FROM user_rooms WHERE room = "${room}"`
    con.query(query, function(err, result) {
        if(err) throw err;
        let users = []
        for(var i=0; i<result.length; i++) {
            users.push(result[i].user)
        }
        io.to(room).emit('update-user-list', users)
    })
}

function loadMessages(room) {
    query = `SELECT * FROM chat_line WHERE room_name = "${room}" ORDER BY time_created ASC`
    con.query(query, function(err, result) {
        console.log("loading messages")
        for(var i=0; i<result.length; i++) {
            message = formatMessage(result[i].user_name, result[i].line_text)
            message.time = result[i].time_created
            socket.emit('new-message', message)
        }
    })
}   

var con = mysql.createConnection({
    host: "localhost",
    user: "ding",
    password: "sql",
    database: "chatroom",
})

var socket = 'NA'
var io = 'NA'

con.connect(function(err) {
    if(err) throw err;
    console.log(`mysql connected`)
})

function init_sql(sock, i_o) {
    socket = sock;
    io = i_o;
}

function execute(query) {
    con.query(query, function(err, result) {
        if(err) throw err;
    })
}


module.exports = {
    clearAllMessages,
    userLogin,
    newRoom,
    userSocket,
    delUserSocket,
    userJoinRoom,
    updateUserList,
    init_sql,
    loadMessages,
    insertMessage,
    userLeaveRoom,
}