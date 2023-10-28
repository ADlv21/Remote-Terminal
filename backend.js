const express = require("express");
const expressWs = require("express-ws");
const os = require("os");
const pty = require("node-pty");
const path = require("path");

const app = express();
expressWs(app);

console.log("Server is up and running...");

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
var ptyProcess = pty.spawn(shell, [], {
  name: "xterm-256color",
  cwd: process.env.PWD,
  env: {
    PS1: "\\W$ ",
    ...process.env,
  },
});

app.use(express.static(path.join(__dirname, "public")));

app.ws("/shell", (ws, req) => {
  console.log("New WebSocket connection");

  ws.on("message", (msg) => {
    console.log("Received WebSocket message:", msg);
    ptyProcess.write(msg);
  });

  ptyProcess.on("data", (data) => {
    ws.send(data);
    console.log("Sending data over WebSocket:", data);
  });
});

const server = app.listen(6060, () => {
  console.log("Express.js WebSocket server is listening on port 6060.");
});
