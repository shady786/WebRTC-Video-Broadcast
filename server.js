const express = require("express");
const app = express();

let broadcaster;
const port = 5000;

const path = require("path");
const fs = require("fs");
const https = require("https");

var ca = [];
  var files = [
    path.join(__dirname, "./certs/shahidachmat.com-le.bundle")
  ]
  for (var i = 0; i < files.length; i++) {
    ca.push(fs.readFileSync(files[i], 'utf8'));
  }

  var privateKey  = fs.readFileSync(path.join(__dirname, './certs/shahidachmat.com-le.key'), 'utf8');
  var certificate = fs.readFileSync(path.join(__dirname, './certs/shahidachmat.com-le.crt'), 'utf8');
  var credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  
const server = https.createServer(credentials, app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
