const { User } = require("../modal/User");
const crypto=require('crypto');
const { sanitizeUser, sendMail } = require("../services/common");
const jwt = require('jsonwebtoken');

exports.createUser=async(req,res)=>{
    try {
        const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword){
        const user=new User({...req.body,password:hashedPassword,salt});
        const doc=await user.save();
        req.login(sanitizeUser(doc),(err)=>{ 
            if(err)
            {
                res.status(400).json(err);
            }
            else{
                const token = jwt.sign(sanitizeUser(doc),process.env.JWT_SECRET_KEY);
                res.cookie('jwt', token, { expires: new Date(Date.now() + 3600000), httpOnly: true })
                res.status(201).json({id:doc.id,role:doc.id});
            }
        })
        
    })
    } catch (error) {
        res.status(400).json(error);
    }
    }
    exports.loginUser=async(req,res)=>{
        const user=req.user;

        res.cookie('jwt',user.token,{ expires: new Date(Date.now() + 3600000), httpOnly: true })
        res.status(201).json({id:user.id,role:user.role});
    }

    exports.logout=async(req,res)=>{

        res.cookie('jwt', null, { expires: new Date(Date.now()), httpOnly: true })
      .sendStatus(200);
    } 

    exports.checkAuth=async(req,res)=>{
        if(req.user)
        {
            res.json(req.user);
        }
        else{
            res.sendStatus(401)
        }
     }


     exports.resetPasswordRequest=async(req,res)=>{
        const email=req.body.email
        const user= await User.findOne({email:email});
        if(user)
        {
            const token=crypto.randomBytes(48).toString('hex');
            user.resetPasswordToken=token;
            await user.save();
       
            const  resetPageLink='http://localhost:8080/reset-password?token='+token+'&email='+email;
        const subject="reset Password for VeloxMD-pharma";
        const html=`<p> Click<a href='${resetPageLink}'>here</a> to reset Password </p>`
        if(email)
        {
          const response= await sendMail({to:email,subject,html});
        res.json(response);
        }
        else{
            res.sendStatus(404)
        }
        }
        else{
            res.sendStatus(404)   
        }
        
     }

     exports.resetPassword=async(req,res)=>{
        const{email,password,token}=req.body;
        const user= await User.findOne({email:email,resetPasswordToken:token});
       
        if(user)
        { 
       const salt = crypto.randomBytes(16);
       crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword){
        user.password=hashedPassword;
        user.salt=salt;
        await user.save();
        const subject=" Successfully Reset Password for VeloxMD-pharma";
        const html=`<p> Successfully Reset Password </p>`
        if(email)
        {
          const response= await sendMail({to:email,subject,html});
        res.json(response);
        }
        else{
            res.sendStatus(404)
        }
       })
           
        }
        else{
            res.sendStatus(404)   
        }
        
     }