const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); 
const passport = require('passport');
const session = require('cookie-session');
const path = require('path');
require('./config/passport');

const connectDB = require('./config/conectDB');
const authRouter = require('./routers/auth.router');
const friendRouter = require('./routers/friendship.router');
const messageRouter = require('./routers/message.router'); 
const groupRouter = require('./routers/group.router');
const adminRouter = require('./routers/admin.router');
const postRouter = require('./routers/post.router');
const globalErrorHandler = require('./controllers/error.controller');

const app = express();

// 1. Render-ისთვის აუცილებელი პარამეტრი
app.set('trust proxy', 1); 

const server = http.createServer(app);

// 2. CORS-ის მაქსიმალურად მოქნილი კონფიგურაცია
app.use(cors({ 
  origin: [
    'https://social-net-silk.vercel.app',
    'https://social-net-git-main-nikoloz-kvelashvilis-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser()); 
app.use(morgan('dev'));

const io = new Server(server, {
  cors: { 
    origin: [
      'https://social-net-silk.vercel.app',
      'https://social-net-git-main-nikoloz-kvelashvilis-projects.vercel.app'
    ],
    credentials: true 
  }
});

connectDB();

// 3. სესიის კონფიგურაცია (გასწორებული proxy-ით)
app.use(session({
  name: 'session',
  keys: ['cyber-key'], 
  maxAge: 24 * 60 * 60 * 1000, // 24 საათი
  secure: true,      
  sameSite: 'none',  
  httpOnly: true,
  proxy: true // <-- Render-ზე ქუქიების მისაღებად
}));

app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) { request.session.regenerate = (cb) => cb(); }
    if (request.session && !request.session.save) { request.session.save = (cb) => cb(); }
    next();
});

app.use(passport.initialize());
app.use(passport.session());

const onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('setup', (userId) => {
        if (!userId) return;
        socket.join(userId.toString());
        onlineUsers[userId] = socket.id;
        io.emit('userStatusUpdate', Object.keys(onlineUsers));
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on('new message', (newMessageReceived) => {
        const chatRoom = newMessageReceived.group || newMessageReceived.receiver;
        if (!chatRoom) return;
        socket.to(chatRoom.toString()).emit('message received', newMessageReceived);
    });

    socket.on('disconnect', () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                break;
            }
        }
        io.emit('userStatusUpdate', Object.keys(onlineUsers));
    });
});

app.set('socketio', io);
app.set('onlineUsers', onlineUsers);

// API როუტები
app.use('/api/auth', authRouter);
app.use('/api/friend', friendRouter);
app.use('/api/message', messageRouter);
app.use('/api/groups', groupRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/posts', postRouter);

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});