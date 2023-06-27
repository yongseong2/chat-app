# Express.js와 soket.io를 활용하여 채팅서버 구현

### 1. node.js 프로젝트 폴더 생성 및 package 설치

- node 프로젝트를 생성합니다.

```jsx
npm init
```

- 서버생성을 위한 expressjs를 설치합니다.

```jsx
npm install express socket.io
```

### 2. 서버의 기본세팅 라우터 설정

1. 서버 스크립트 파일(app.js)을 생성하고 필요한 모듈을 가져옵니다.
2. http 모듈을 사용하여 express 서버를 생성합니다.
3. 서버를 특정 포트(8080)로 listen하도록 설정합니다.
4. 사용자가 '/' 경로로 접속했을 때 index.html을 보여주도록 라우터를 설정합니다.
5. index.html 파일을 생성하여 웹에 노출시킵니다.
6. express의 static 미들웨어를 사용하여 정적 파일(HTML, CSS, JavaScript 등)에 접근할 수 있도록 설정합니다.
7. 서버를 실행하고 localhost:8080으로 접속하여 index.html의 내용을 확인합니다.

```jsx
// app.js

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require('fs');

// 정적 파일 설정
app.use(express.static('src'));

// 라우터 설정
app.get('/', function(req, res){
    fs.readFile('./src/index.html', (err, data) => {
        if(err) throw err;

        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })
        .write(data)
        .end();
    });
});

// 서버 실행
server.listen(8080, function(){
    console.log('서버 실행중...');
});
```

### 3. Socket.IO를 사용하여 클라이언트와 서버 간의 통신을 설정하는 방법

1. 클라이언트 스크립트 파일 생성 후 로드시키기:
    - **`index.js`** 파일을 **`src/js/`** 폴더에 생성합니다.
    - **`index.html`** 파일에서 아래 스크립트를 추가하여 파일을 로드합니다:
        
        ```jsx
        htmlCopy code
        <script src="/socket.io/socket.io.js"></script>
        <script src="/js/index.js"></script>
        
        ```
        
2. 서버와 클라이언트 간 양방향 스크립트 추가하기:
    - **`app.js`** 파일에서 Socket.IO 모듈을 사용하기 위해 **`io`** 변수에 할당합니다.
    - **`io.sockets.on('connection', function(socket) { ... });`**으로 소켓 연결 이벤트를 처리할 함수를 바인딩합니다.
    - 클라이언트에서 **`socket.on('connect', function() { ... });`**으로 연결 이벤트에 대한 콜백 함수를 작성합니다.
3. 사용자 입력을 받아 대화명 저장하기:
    - 클라이언트의 **`socket.on('connect', function() { ... });`** 콜백 함수에서 **`prompt`**를 사용하여 대화명을 입력받습니다.
    - 입력받은 대화명을 **`socket.emit('newUserConnect', name);`**로 서버에 전송합니다.
    - 서버의 **`socket.on('newUserConnect', function(name) { ... });`**에서 대화명을 소켓 객체의 속성으로 저장합니다.
4. 사용자 입력값을 웹 페이지에 표시하기:
    - 서버의 **`socket.on('newUserConnect', function(name) { ... });`**에서 대화명을 저장한 후, **`io.sockets.emit('updateMessage', { name: 'SERVER', message: message });`**를 사용하여 모든 클라이언트에게 메시지를 보냅니다.
    - 클라이언트의 **`socket.on('updateMessage', function(data) { ... });`**에서 받은 데이터를 사용하여 웹 페이지에 메시지를 표시합니다.
    
    ### 4. 채팅 애플리케이션의 구현
    
    1. 사용자가 들어오고 나가는 부분을 캐치하여 서버가 안내하는 말을 노출하기:
        - 사용자가 접속하면 서버는 "newUserConnect" 이벤트를 수신하고, 접속한 사용자의 이름을 저장하여 다른 모든 소켓에게 해당 정보를 알립니다.
        - 사용자가 퇴장하면 "disconnect" 이벤트를 수신하고, 퇴장한 사용자의 이름을 포함한 메시지를 다른 모든 소켓에게 알립니다.
    
    ```jsx
    socket.on('disconnect', ()=> {
        const message = socket.name + '님이 퇴장했습니다.'
        socket.broadcast.emit('updateMessage', {
          name: 'SERVER',
          message : message
        })
      })
    ```
    
    2.  메시지를 전송하고 받아기:
        - 사용자는 채팅 메시지를 입력하고 전송할 수 있습니다.
        - 전송 버튼을 클릭하면 클라이언트는 "sendMessage" 이벤트를 발생시켜 서버에 메시지를 전송합니다.
        - 서버는 해당 메시지를 받아서 모든 소켓에게 알립니다.
        - 클라이언트는 서버로부터 받은 메시지를 화면에 출력합니다.
    
    ```jsx
    // app.js
    
    socket.on('sendMessage', (data)=>{
        data.name = socket.name
        io.sockets.emit('updateMessage', data)
      })
    })
    ```
    
    ```jsx
    // index.js
    
    const chatWindow = document.getElementById('chatWindow')
    socket.on('updateMessage', function (data) {
      if (data.name === 'SERVER') {
        const info = document.getElementById('info')
        info.innerHTML = data.message
    
        setTimeout(() => {
          info.innerText = ''
        }, 1000)
    
      } else {
        const chatMessageEl = drawChatMessage(data)
        chatWindow.appendChild(chatMessageEl)
    
        chatWindow.scrollTop = chatWindow.scrollHeight
      }
    })
    
    function drawChatMessage(data) {
      const wrap = document.createElement('p')
      const message = document.createElement('span')
      const name = document.createElement('span')
    
      name.innerText = data.name
      message.innerText = data.message
    
      name.classList.add('output__user__name')
      message.classList.add('output__user__message')
    
      wrap.classList.add('output__user')
      wrap.dataset.id = socket.id
    
      wrap.appendChild(name)
      wrap.appendChild(message)
    
      return wrap
    }
    const sendButton = document.getElementById('chatMessageSendBtn')
    const chatInput = document.getElementById('chatInput')
    
    ```
    
    3. 스타일을 입히기(css파일 활용)