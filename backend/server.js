const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const connectDB = require('./config/db');
const userRoutes=require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const path = require("path");

dotenv.config()
connectDB()
const app= express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['https://chat-buddy-flst.onrender.com', 'http://localhost:3000']
}));
const io = new Server(server, {
    cors: {
        origin: ['https://chat-buddy-flst.onrender.com', 'http://localhost:3000']
    }
});

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)

// deployment

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/frontend/build")));
    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
    );
} else {
    app.get("/", (req, res) => {
        res.send("API is running..");
    });
}



app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT||5000;

server.listen(PORT,()=>{
    console.log('listening on port',PORT)
})

var activeCalls = new Map();
io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        // console.log(userData._id)
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        // console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {

        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.to(user._id).emit("message recieved", newMessageRecieved);
        });
    });


    socket.on("video-call", (videoCallChat, callUser, user,offer) => {
        // console.log(callUser, user);

        // Store call data globally
        const callId = `${callUser}-${user}`;  // Unique ID for the call
        activeCalls.set(callId, { isCallPicked: false });
        // console.log("call id 1 : ", callId)


        socket.to(callUser).emit("user-calling", videoCallChat,offer);
        

        // Timeout to check if the call is picked
        setTimeout(() => {
            if (!activeCalls.get(callId)?.isCallPicked) {
                console.log("Call not picked, ending...");
                // socket.to(user).emit("end call");
                io.to(callUser).to(user).emit("end call");
            }
            activeCalls.delete(callId);  // Clean up after the call
        }, 20000);
    });
  
    // Use stored data when call is accepted
    socket.on("call accepted", (callUser, user,ans) => {
        // console.log("call accepted")
        const callId = `${callUser}-${user}`;
        // console.log("call id 2 : ",callId)


        if (activeCalls.has(callId)) {
            activeCalls.get(callId).isCallPicked = true;  // Set picked status
            console.log(`Call accepted by: ${user}`);

            // Notify both clients
            socket.to(user).emit("call accepted",ans);
            // socket.to(callUser).emit("call accepted");
        }
    });


    socket.on("end call", (callUser, user) => {
        const callId1 = `${callUser}-${user}`;
        const callId2 = `${user}-${callUser}`;
        if (activeCalls.has(callId1))
        activeCalls.delete(callId1);  // Clean up the call status
        if (activeCalls.has(callId2))
            activeCalls.delete(callId2);  // Clean up the call status
        socket.to(callUser).emit("end call");
    });

    
    socket.on("new-ice-candidate",(candidate,sendTo)=>{
        // console.log("candidate received : ",candidate);
        socket.to(sendTo).emit("new-ice-candidate",candidate)
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
