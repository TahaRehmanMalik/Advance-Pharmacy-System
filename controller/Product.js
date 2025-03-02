const { Product } = require("../modal/Product")

exports.createProduct=async(req,res)=>{
   
    const product=new Product(req.body);
   try {
 const doc=await product.save();
    res.status(201).json(doc);
   } catch (error) {
    res.status(400).json(error);
   }

}
exports.fetchAllProducts=async(req,res)=>{
   
   let condition={};
   if(!req.query.admin)
   {
    condition.deleted={$ne:true}
   }
   let query =Product.find(condition);
   let totalProductsQuery=Product.find(condition);
   if(req.query.category)
   {
  query=query.find({category:{$in:req.query.category.split(',')}});
  totalProductsQuery=totalProductsQuery.find({category:{$in:req.query.category.split(',')}});
   }
   if(req.query.manufacturer)
   {
  query=query.find({manufacturer:{$in:req.query.manufacturer.split(',')}});
  totalProductsQuery=totalProductsQuery.find({manufacturer:{$in:req.query.manufacturer.split(',')}});
   }
   const totalDocs=await totalProductsQuery.count().exec();

 
   if (req.query._page&&req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize*(page - 1)).limit(pageSize);
    }
  try {
const docs=await query.exec();
   res.set('X-Total-Count',totalDocs);
   res.status(200).json(docs);
  } 
  catch (error) {
   res.status(400).json(error);
  }

}
exports.fetchProductById=async(req,res)=>{
   const {id}=req.params;
try {
   const product=await Product.findById(id);
   res.status(200).json(product);
} catch (error) {
   res.status(400).json(error);
}
}
exports.updateProduct=async(req,res)=>{
   const {id}=req.params;
   try {
      const product=await Product.findByIdAndUpdate(id,req.body,{new:true}).exec();
      res.status(200).json(product);
   } catch (error) {
      res.status(400).json(error);
   }
}