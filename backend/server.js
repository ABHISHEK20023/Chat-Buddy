const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const connectDB = require('./config/db');
const userRoutes=require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config()
connectDB()
const app= express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

app.get('/',(req,res)=>{
    res.send("api is running")
})

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)


app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT||5000;

server.listen(PORT,()=>{
    console.log('listening on port',PORT)
})


io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        // console.log(newMessageRecieved)
        socket.to(newMessageRecieved.chat._id).emit("message recieved", newMessageRecieved);

        // var chat = newMessageRecieved.chat;
        // if (!chat.users) return console.log("chat.users not defined");

        // chat.users.forEach((user) => {
        //     if (user._id == newMessageRecieved.sender._id) return;

        //     socket.in(user._id).emit("message recieved", newMessageRecieved);
        // });
    });
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
