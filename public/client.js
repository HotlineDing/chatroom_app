console.log('client connecting')
const socket = io('http://localhost:5000')
console.log('client connected')

const messageContainer = document.getElementById("message-container")
const messageForm = document.getElementById('form')
const messageInput = document.getElementById('input')

const name = prompt('What is your name?')
appendMessage(`You(${name}) joined`, 'update')
socket.emit('new-user', name)

socket.on('add-message', data => {
  if(data.name === name) {
    appendMessage(`${data.name}: ${data.message}`, 'user')
  }else {
    appendMessage(`${data.name}: ${data.message}`, 'message')
  }
  
  // appendMessage(`${data}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'update')
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'update')
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  if(message){
    // appendMessage(`You: ${message}`, 'user')
    socket.emit('send-chat-message', message)
    messageInput.value = ''
  }
})

function appendMessage(message, options) {
  const messageElement = document.createElement('p')
  if (options === 'user') {
    messageElement.className = 'user';
  } else {
    messageElement.className = options;
  }
    
  messageElement.innerText = message
  messageContainer.append(messageElement)
}