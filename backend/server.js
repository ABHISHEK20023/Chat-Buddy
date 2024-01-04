const express=require('express');
const { chats } = require('./data/data');
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
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.get('/',(req,res)=>{
    res.send("api is running")
})

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)


app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
    console.log('listening on port',PORT)
})