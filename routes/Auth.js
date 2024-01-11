const express=require('express');
const { createUser,loginUser, checkAuth,resetPasswordRequest,logout,resetPassword} = require('../controller/Auth');
const router=express.Router();
const passport=require('passport');

router.post('/signup',createUser)
.post('/login',passport.authenticate('local'),loginUser)
.get('/check',passport.authenticate('jwt'),checkAuth)
.post('/reset-password-request',resetPasswordRequest)
.post('/reset-password',resetPassword)
.get('/logout',logout)


exports.router=router