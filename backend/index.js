const mongoose = require('mongoose')
const express = require('express')
const dotenv = require('dotenv')
const helmet = require('helmet')
const cors = require('cors')
const cookiesParser = require('cookie-parser')
const path = require('path');
const { NotificationScheduler, scheduler } = require('./utils/NotificationScheduler');
const dataController = require('./constrollers/dataController')

dotenv.config()

const PORT = process.env.PORT || 3200

const authRouter = require('./routers/authRouter')
const dataRouter = require('./routers/dataRouter')

const app = express()
app.use(cors({
    origin: process.env.CORS, // your frontend origin
    credentials: true, // 🔑 allow cookies to be sent
  }))
app.use(helmet())
app.use(cookiesParser())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

//DB connection
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('DB connected')
}).catch(err =>{
    console.log('err in db:',err)
})


app.get('/',(req,res)=>{
    res.json({message:"Helloe from server"})
})

const initializeScheduler = async () => {
    try {
        console.log('Starting notification scheduler initialization...');
        
        // Pass the triggerNotification function to the scheduler
        await scheduler.init(dataController.triggerNotification);
        
        console.log('Notification scheduler initialized successfully');
    } catch (error) {
        console.error('Failed to initialize notification scheduler:', error);
    }
};

app.use('/api/auth',authRouter)
// app.use('/api/whatsapp',whatsappRouter)
app.use('/api/data',dataRouter)



// const server = http.createServer(app);
// const wss = new Websocket.Server({server});
// wss.on('connection', handleConnection);
app.listen(PORT, async () => {
    console.log(`Localhost running on: http://localhost:${PORT}`);
    await initializeScheduler();
    });

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    scheduler.stopAll();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    scheduler.stopAll();
    process.exit(0);
});