const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const fs = require('fs')
const io = require('socket.io')(server)

app.use(express.static('src'))
app.get('/', function(req, res) {
  fs.readFile('./src/index.html', (err, data)=>{
    if (err) throw err
    
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    .write(data)
    .end()
  })
})

io.sockets.on('connection', (socket)=>{
  socket.on('newUserConnect', (name)=>{
    socket.name = name

    const message = name + '님이 접속했습니다.'
    io.sockets.emit('updateMessage', {
      name: 'SERVER',
      message : message
    })
  })

  socket.on('disconnect', ()=> {
    const message = socket.name + '님이 퇴장했습니다.'
    socket.broadcast.emit('updateMessage', {
      name: 'SERVER',
      message : message
    })
  })

  socket.on('sendMessage', (data)=>{
    data.name = socket.name
    io.sockets.emit('updateMessage', data)
  })
})


server.listen(8080, ()=>{
  console.log('서버 실행중...')
})