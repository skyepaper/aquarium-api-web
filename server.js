const express = require("express");
const mongoose=require('mongoose');
const events = require('events');
const {addEventListener}=require('event-target');

const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app=express();
app.use(express.json());
app.use(cors());

server = require('http').createServer(app);

mongoose.connect('mongodb+srv://borismirevbm:2YacEBc3qgz4OiLJ@aquarium.6ud9dig.mongodb.net/aquarium?retryWrites=true&w=majority', {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log('Connected to DB'))
  .catch(console.error);

const Message=require('./models/Message');
const Reply=require('./models/Reply');
const User=require('./models/User');
const Like=require('./models/Like');
const Postbox=require('./models/Postbox');

const io = new Server(server, {
  cors: {
   // origin: "http://localhost:3000",
      origin: "https://aquarium5.web.app",
    methods: ["GET", "POST"],
  },
  'force new connection': true 
});
server.listen(3002);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
    
     socket.on('disconnect', function () {
    console.log(`User DisConnected: ${socket.id}`);
});

  const messageEventEmitter = Message.watch();
  messageEventEmitter.on('change', change => {
    let text='message';
      socket.emit('message',{text});
  });
  const replyEventEmitter = Reply.watch();
  replyEventEmitter.on('change', change => {
    let text='reply';
      socket.emit('message',{text});
  });
  const userEventEmitter = User.watch();
  userEventEmitter.on('change', change => {
    let text='user';
    socket.emit('message',{text});
  });

  const likeEventEmitter = Like.watch();
  likeEventEmitter.on('change', change => {
    let text='like';
    socket.emit('message',{text});
  });

  const postboxEventEmitter = Postbox.watch();
  postboxEventEmitter.on('change', change => {
    let text='postbox';
    socket.emit('message',{text});
  });



});


app.get('/messages', async(req,res)=>{  

    const messages=await Message.find();
    res.json(messages);
});

app.post('/message/new', async (req,res)=>{

    const message=new Message({

        text:req.body.text,
        senderId:req.body.senderId
    });
    message.save();
    res.json(message);
});

app.get('/replies', async(req,res)=>{

    const replys=await Reply.find();
    res.json(replys);
});

app.post('/reply/new', async (req,res)=>{

    const reply=new Reply({

        text:req.body.text,
        senderId:req.body.senderId,
        messageId:req.body.messageId
    });
    reply.save();
    res.json(reply);
});

app.get('/users', async(req,res)=>{

    const users=await User.find();
    res.json(users);
});

app.post('/user/new', async (req,res)=>{

    const user=new User({

        email:req.body.email,
        name:req.body.name,
        image:req.body.image,
    });
    user.save();
    res.json(user);
});

app.put('/user/save/:id', async (req,res)=>{

    const user=await User.findByIdAndUpdate(req.params.id);
   if(user) {
    user.name= req.body.name;
    user.image= req.body.image;
   }
   
    user.save();
    res.json(user);
});

app.put('/user/star/:id', async (req,res)=>{

    const user=await User.findByIdAndUpdate(req.params.id);
   if(user) {
    user.goldLike= req.body.goldLike;
    user.gold= req.body.gold;
   }
   
    user.save();
    res.json(user);
});

app.get('/postboxes', async(req,res)=>{  

    const postboxes=await Postbox.find();
    res.json(postboxes);
});

app.post('/postbox/new', async (req,res)=>{

    const postbox=new Postbox({

        userId:req.body.userId,
        senderId:req.body.senderId,
        type:req.body.type,
        status:req.body.status,
        gold:req.body.gold,

    });
    postbox.save();
    res.json(postbox);
});

app.put('/postbox/save/:id', async (req,res)=>{

    const postbox=await Postbox.findByIdAndUpdate(req.params.id);
   if(postbox) {
    postbox.status= req.body.status;
        postbox.save();
   }
   
    res.json(postbox);
});

app.delete('/postbox/delete/:id', async (req,res)=>{

    const result=await Postbox.findByIdAndDelete(req.params.id);
  
});

app.get('/likes', async(req,res)=>{  

    const likes=await Like.find();
    res.json(likes);
});

app.post('/like/new', async (req,res)=>{

    const like=new Like({

        userId:req.body.userId,
        messageId:req.body.messageId,
       
    });
    like.save();
    res.json(like);
});

