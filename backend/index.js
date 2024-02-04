const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const candidateRoute = require('./controller/candidateRoutes.js');
const intervieweeRoutes = require('./controller/intervieweeRoutes.js');
const connectDB = require('./config/db.js');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use('/api/candidate', candidateRoute);
app.use('/api/interviewee', intervieweeRoutes);


const server = http.createServer(app); // Create an http server using the express app

const io = require('socket.io')(server, { cors: true });


io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { userid, room } = data;
    io.to(room).emit("user:joined", { userid: userid, from: socket.id });
    socket.join(room);
  });

  socket.on("code:change", ({ code, roomid }) => {
    io.to(roomid).emit("code:changed", { code })
  })

  socket.on("output:change", ({ output, roomid }) => {
    io.to(roomid).emit("output:changed", { output })
  })

  socket.on("user:leavewindow", ({  room }) => {
    io.to(room).emit("user:leftwindow", { success: true})
  })

  socket.on("user:joinwindow", ({ room }) => {
    io.to(room).emit("user:joinedwindow", { success: true })
  })

  socket.on("room:end", ({ room, interviewid }) => {
    console.log("interviewid", interviewid)
    io.to(room).emit("room:ended", { interviewid: interviewid })
  })

  socket.on("draw:change", ({ draw, roomid }) => {
    console.log("draw",draw)
    io.to(roomid).emit("draw:changed", { draw })
  })

  socket.on("inter:details", ({ userid, to }) => {
    io.to(to).emit("inter:joined", { userid, from: socket.id })
  })

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { offer, from: socket.id });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("accepted:call", { ans, from: socket.id });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { offer, from: socket.id });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});


server.listen(process.env.BPORT || 5000, () => {
  console.log('Server started at port', process.env.BPORT || 5000);
});