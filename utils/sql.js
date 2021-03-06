const mysql = require('mysql')
const formatMessage = require('./messages')


class SQL_database {
    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: "ding",
            password: "sql",
            database: "chatroom",
        })

        this.con.connect(function(err) {
            if(err) throw (err);
            console.log(`mysql connected`)
        })
    }

    query(Query, callback) {
        this.con.query(Query.query, (err,result) => {
            if(err) reject(err);
            console.log(Query.query)
            // Query.callback()
            if(callback != null) callback(result)
        })
    }

    update(event, packet, callback) {
        return new Promise((resolve, reject) => {
            let query = null;
            query = new Query(event, packet)
            
            this.query(query, callback)
            resolve('success')
        })
    }
}



class Query {
    user = null;
    room = null;
    socket_id = null;
    message = null;
    event = '';

    constructor(event, packet) {
        this.user = packet.user;
        this.room = packet.room;
        this.socket_id = packet.socket_id;
        this.message = packet.message;
        this.event = event;

        try {
            const queries = {
                'user_login': `INSERT IGNORE INTO users (name) VALUES ("${this.user}")`,
                'user_socket': `INSERT IGNORE INTO sockets (id, user) VALUES ("${this.socket_id}", "${this.user}")`,
                'rm_user_socket': `DELETE FROM sockets WHERE id = "${this.socket_id}"`,
                'new_room': `INSERT IGNORE INTO rooms (room_name) VALUES ("${this.room}")`,
                'user_join_room': `INSERT IGNORE INTO user_rooms (room, user, status) VALUES ("${this.room}", "${this.user} ", "ACTIVE")`,
                'user_leave_room': `DELETE FROM user_rooms WHERE room = "${this.room}" AND user = "${this.user}"`, 
                'insert_message': `INSERT INTO chat_line (room_name, user_name, line_text) VALUES ("${this.room}", "${this.user}", "${this.message}")`,
                'clear_all_messages': `DELETE FROM chat_line`,
                'load_messages': `SELECT * FROM chat_line WHERE room_name = "${this.room}" ORDER BY time_created ASC`,
                'get_user_list': `SELECT DISTINCT room, user FROM user_rooms WHERE room = "${this.room}"`,
            }    

            this.query = queries[event]
        } catch (error) {
            console.log('invalid query')
        }
    }
}


const events = {
    user_login: 'user_login',
    user_socket: 'user_socket',
    rm_user_socket: 'rm_user_socket',
    new_room: 'new_room',
    user_join_room: 'user_join_room',
    user_leave_room: 'user_leave_room',
    insert_message: 'insert_message',
    clear_all_messages: 'clear_all_messages',
    load_messages: 'load_messages',
    get_user_list: 'get_user_list',
}



module.exports = {
    SQL_database,
    Query,
    events,
}