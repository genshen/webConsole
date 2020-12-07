import { Terminal } from "xterm";

interface TermSize {
  rows: number
  cols: number
}

const resize = {
  bindTerminalResize: function (term: Terminal, websocket: WebSocket) {
    const onTermResize = (size: TermSize) => {
      websocket.send(
        JSON.stringify({
          type: "resize",
          data: { rows: size.rows, cols: size.cols }
        })
      );
    };
    // register resize event.
    const resizeListener = term.onResize(onTermResize);
    // unregister resize event when WebSocket closed.
    websocket.addEventListener("close", function () {
      resizeListener.dispose();
    });
  }
};

export default resize;
