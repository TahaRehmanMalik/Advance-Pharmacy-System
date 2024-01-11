const { Order } = require("../modal/Order");
const {User}= require("../modal/User");
const { Product } = require("../modal/Product");
const { sendMail, invoiceTemplate } = require("../services/common");

exports.fetchOrdersByUser=async(req,res)=>{
    const {id}=req.user;
    try {
  const orders=await Order.find({user:id});
  res.status(200).json(orders);
} catch (error) {
    res.status(400).json(error);
}
}

exports.createOrder=async(req,res)=>{
    
    const order=new Order(req.body);
    for(let item of order.items)
    {
      let product=await Product.findOne({_id:item.product.id})
       product.$inc('stock',-1*item.quantity);
       await product.save();
    }
   try {
 const doc=await order.save();
 const user=await User.findById(order.user);
 sendMail({to:user.email,html:invoiceTemplate(order),subject:'Order Received'});
    res.status(201).json(doc);
   } catch (error) {
    res.status(400).json(error);
   }

}


exports.deleteOrder=async(req,res)=>{
 
  const {id}=req.params;
 try {
const order=await Order.findByIdAndDelete(id)
  res.status(200).json(order);
 } catch (error) {
  res.status(400).json(error);
 }

}
exports.updateOrder=async(req,res)=>{
  const {id}=req.params;
  try {
    
    const order=await Order.findByIdAndUpdate(id,req.body,{new:true})
    
    console.log("the order is",order);
    if(order.status==='dispatched'&&order.paymentStatus==='pending')
    {
      sendMail({to:order.selectedAddress.email,html:`<p>Your order is ${order.status}</p>`,subject:'Order information'});
    }
     else if(order.status==='delivered'&&order.paymentStatus==='received')
     {
      sendMail({to:order.selectedAddress.email,html:`<p>Your order is ${order.status} and payment is ${order.paymentStatus}</p>`,subject:'Order information'});
     }
     else if(order.status==='cancelled'&&order.paymentStatus==='pending')
     {
      sendMail({to:order.selectedAddress.email,html:`<p>Your order is ${order.status}</p>`,subject:'Order information'});
     }
     else{
      sendMail({to:order.selectedAddress.email,html:`<p>Your order is ${order.status}</p>`,subject:'Order information'});

     }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
}

exports .fetchAllOrders=async(req,res)=>{
  let query=Order.find({deleted:{$ne:true}})
  let totalOrdersQuery=Order.find({deleted:{$ne:true}})

const totalDocs=await totalOrdersQuery.count().exec();
  if(req.query._page&&req.query._limit)
  {
    const pageSize=req.query._limit;
    const page=req.query._page;
    query=query.skip(pageSize*(page-1)).limit(pageSize)
  }
  try {
    const docs=await query.exec();
    res.set('X-Total-Count',totalDocs);
    res.status(200).json(docs);
  } catch (error) {
    res.status(400).json(error);
  }
}