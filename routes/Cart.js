const express=require("express");
const { fetchCartByUser, addToCart, deleteItemFromCart, updateCart } = require("../controller/Cart");
const router=express.Router();
router.post('/',addToCart)
.get('/',fetchCartByUser)
.delete('/:id',deleteItemFromCart)
.patch('/:id',updateCart)
exports.router=router;