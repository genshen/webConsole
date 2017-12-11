const sshWebSocket = {}
sshWebSocket.bindTerminal = function (term, websocket, bidirectional, bufferedTime) {
  term.socket = websocket

  let messageBuffer = null
  let handleWebSocketMessage = function (ev) {
    if (bufferedTime && bufferedTime > 0) {
      if (messageBuffer) {
        messageBuffer += ev.data
      } else {
        messageBuffer = ev.data
        setTimeout(function () {
          term.write(JSON.stringify({type: 'data', data: messageBuffer}))
        }, bufferedTime)
      }
    } else {
      term.write(JSON.stringify({type: 'data', data: ev.data}))
    }
  }
  let handleTerminalData = function (data) {
    websocket.send(data) // todo: json
  }

  websocket.onmessage = handleWebSocketMessage
  if (bidirectional) {
    term.on('data', handleTerminalData)
  }

  websocket.addEventListener('close', function () {
    websocket.removeEventListener('message', handleWebSocketMessage)
    term.off('data', handleTerminalData)
    console.log('socket closed!')
    delete term.socket
  })
}

export default sshWebSocket
