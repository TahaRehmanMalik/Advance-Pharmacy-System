const express=require("express");
const { createOrder, fetchOrdersByUser, deleteOrder, updateOrder, fetchAllOrders } = require("../controller/Order");
const router=express.Router();

router.post('/',createOrder)
.get('/own/',fetchOrdersByUser)
.delete('/:id',deleteOrder)
.patch('/:id',updateOrder)
.get('/',fetchAllOrders)
exports.router=router;