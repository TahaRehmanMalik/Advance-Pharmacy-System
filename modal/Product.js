const mongoose=require("mongoose");
const {Schema}=mongoose;
const productSchema=new Schema({
name:{type:String,required:true,unique:true},
form:{type:String,required:true},
packSize:{type:String,required:true},
description:{type:String,required:true},
discountPercentage:{type:Number,min:[0,'wrong min discount'],max:[100,"wrong max discount"]},
manufacturer:{type:String,required:true},
price:{type:Number,min:[1,'wrong price'],max:[10000,"wrong max price"]},
stock:{type:Number,min:[0,'wrong min stock']},
thumbnail:{type:String,required:true},
image:{type:[String],required: true},
category:{type:String,required:true},
deleted:{type:Boolean,default:false}

})
const virtual=productSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
productSchema.set('toJSON',{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret){
        delete ret._id;
    }
})
exports.Product=mongoose.model('Product',productSchema);