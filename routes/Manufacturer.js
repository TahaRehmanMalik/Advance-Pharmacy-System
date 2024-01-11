const express=require('express');
const { fetchManufecturers, createManufecturer } = require('../controller/Manufacturer');
const router=express.Router();

router.get('/',fetchManufecturers).post('/',createManufecturer)
exports.router=router;