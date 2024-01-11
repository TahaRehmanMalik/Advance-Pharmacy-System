const express=require('express');
const { } = require('../controller/Auth');
const { fetchUserById, updateUser } = require('../controller/User');
const router=express.Router();

router.get('/own',fetchUserById)
.patch('/:id',updateUser)
exports.router=router