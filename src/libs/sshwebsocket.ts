import { Base64 } from "js-base64";
import { IDisposable, Terminal } from "xterm";

const sshWebSocket = {

  bindTerminal: (
    term: Terminal,
    websocket: WebSocket,
    bidirectional: boolean,
    bufferedTime: number
  ) => {
  // term.socket = websocket;
  let messageBuffer: string = '';
  const handleWebSocketMessage = function (ev: MessageEvent) {
    if (bufferedTime && bufferedTime > 0) {
      if (messageBuffer) {
        messageBuffer += ev.data;
      } else {
        messageBuffer = ev.data;
        setTimeout(function () {
          term.write(messageBuffer);
        }, bufferedTime);
      }
    } else {
      term.write(ev.data);
    }
  };
  const handleTerminalData = function (data: string) {
    websocket.send(
      JSON.stringify({
        type: "terminal",
        data: {
          base64: Base64.encode(data) // encode data as base64 format
        }
      })
    );
  };

  websocket.onmessage = handleWebSocketMessage;
  let dataListener: IDisposable | null = null;
  if (bidirectional) {
    dataListener = term.onData(handleTerminalData);
  }

  // send heartbeat package to avoid closing webSocket connection in some proxy environmental such as nginx.
  const heartBeatTimer = setInterval(function () {
    websocket.send(JSON.stringify({ type: "heartbeat", data: "" }));
  }, 20 * 1000);

  websocket.addEventListener("close", function () {
    websocket.removeEventListener("message", handleWebSocketMessage);
    if (dataListener) {
      dataListener.dispose();
    }
    // delete term.socket;
    clearInterval(heartBeatTimer);
  });
  }
};

export default sshWebSocket;
