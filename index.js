
require('dotenv').config()
const express=require("express");
const server=express();
const multer=require('multer');
const cors=require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy=require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const  ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require("./modal/User");
const jwt = require('jsonwebtoken');
const crypto=require('crypto');
const cookieParser=require('cookie-parser');
const productRouter =require('./routes/Product')
const categoriesRouter=require('./routes/Category');
const manufacturerRouter=require('./routes/Manufacturer');
const userRouter=require('./routes/User');
const authRouter=require('./routes/Auth');
const cartRouter=require('./routes/Cart');
const orderRouter=require('./routes/Order');
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const path=require('path');
const { Order } = require('./modal/Order');

const endpointSecret=process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}),async(request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

 
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log({paymentIntentSucceeded})
      const order=await Order.findById( paymentIntentSucceeded.metadata.orderId)
      order.paymentStatus='received'
      await order.save();
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  
  response.send();
});



const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;



server.use(express.static(path.resolve(__dirname,'build')));
server.use(cookieParser());
server.use(session({
  secret:process.env.SESSION_KEY ,
  resave: false, 
  saveUninitialized: false, 
  
}));
server.use(passport.authenticate('session'));

server.use(cors({
  exposedHeaders:['X-Total-Count']
}))

server.use(express.json());  
server.use('/products',isAuth(),productRouter.router)
server.use('/categories',isAuth(),categoriesRouter.router)
server.use('/manufecturers',isAuth(),manufacturerRouter.router)
server.use('/users',isAuth(),userRouter.router)
server.use('/auth',authRouter.router)
server.use('/cart',isAuth(),cartRouter.router)
server.use('/orders',isAuth(),orderRouter.router)


server.get('*',(req,res)=>res.sendFile(path.resolve('build','index.html')))


passport.use('local',new LocalStrategy({usernameField:'email'},async function(email, password, done) {

    try {
      const user=await User.findOne({email:email}).exec();
      console.log(email,password,user);
      if(!user)
            {
            return done(null,false,{message:"Invalid Credentials"});
            }
      crypto.pbkdf2(
        password,
         user.salt,
          310000,
          32, 
          'sha256', async function(err, hashedPassword){
          
           if(!crypto.timingSafeEqual(user.password, hashedPassword)) 
            {
             return done(null,false,{message:"Invalid Credentials"});      
            }
            const token = jwt.sign(sanitizeUser(user),process.env.JWT_SECRET_KEY);
           
              done(null,{id:user.id,role:user.role,token});  
            
          })
    
  } catch (error) {
      done(error)
  }
  }));


  passport.use('jwt',new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
      const user=await User.findById( jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user));  
    } else {
        return done(null, false);
   
    }
    } catch (error) {
      if (err) {
        return done(err, false);
    }
    }  
}));



passport.serializeUser(function(user, cb) {
  console.log("the serializer",user);
  process.nextTick(function() {
    return cb(null,{id: user.id, role: user.role});
  });
});

passport.deserializeUser(function(user, cb) {
  console.log("the deserializer is",user);
  process.nextTick(function() {
    return cb(null, user);
  });
});


const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY)


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount,orderId } = req.body;

  
  const paymentIntent = await stripe.paymentIntents.create({
    amount:totalAmount*100, 
    currency: "pkr",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      orderId
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});



  

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("database is connected");
}

server.listen(process.env.PORT,()=>{
console.log("server started");
})