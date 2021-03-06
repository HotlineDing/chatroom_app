const socket = io('http://localhost:5000')

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const activeUsers = document.getElementById('users');
const messageInput = document.getElementById('msg');


//Parsing for username and room
const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

//Now join room
socket.emit('userJoinRoom', {username, room})

socket.on('userRoomChange', (user, status) => {
  console.log(user, status)
  const div = document.createElement('div')
  div.classList.add('user_activity')
  div.classList.add('center')
  const p = document.createElement('p');
  if(username == user) {
    p.innerText = `You have joined the room`
  }else {
    if(status === 'enter') {
      p.innerText = `${user} has joined the room`
    }else{
      p.innerText = `${user} has left the room`
    }  
  }
  div.appendChild(p);
  document.querySelector('.chat-messages').appendChild(div);

  chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('new-message', message => {
  console.log(message.text);
  addMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('update-user-list', user_list => {
  activeUsers.innerHTML = '';
  console.log(user_list)
  for(var i=0; i<user_list.length; i++) {
    const li = document.createElement('li');
    li.innerText = user_list[i];
    activeUsers.appendChild(li)
  }
})

chatForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  console.log('message sent')
  if(message){
    socket.emit('send-message', {user:username, message: message, room: room})
    messageInput.value = ''
  }
})


function addMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  if(message.username === username) {
    div.classList.add('right')
  }
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}




