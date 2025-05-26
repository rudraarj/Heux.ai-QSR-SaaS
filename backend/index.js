const mongoose = require('mongoose')
const express = require('express')
const dotenv = require('dotenv')
const helmet = require('helmet')
const cors = require('cors')
const cookiesParser = require('cookie-parser')
const path = require('path');

dotenv.config()

const PORT = process.env.PORT || 3200

const authRouter = require('./routers/authRouter')
const whatsappRouter = require('./routers/whatsappRouter')
const dataRouter = require('./routers/dataRouter')
// const Websocket = require('ws')
// const http = require('http')
// const { handleConnection } = require('./constrollers/wsController')

const app = express()
app.use(cors({
    origin: process.env.CORS, // your frontend origin
    credentials: true, // 🔑 allow cookies to be sent
  }))
app.use(helmet())
app.use(cookiesParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS || '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

//DB connection
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('DB connected')
}).catch(err =>{
    console.log('err in db:',err)
})


app.get('/',(req,res)=>{
    res.json({message:"Helloe from server"})
})

app.use('/api/auth',authRouter)
// app.use('/api/whatsapp',whatsappRouter)
app.use('/api/data',dataRouter)



// const server = http.createServer(app);
// const wss = new Websocket.Server({server});
// wss.on('connection', handleConnection);
app.listen(PORT, () => {
    console.log(`Localhost running on: http://localhost:${PORT}`);
    });