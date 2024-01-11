const mongoose=require("mongoose");
const {Schema}=mongoose;
const manufacturerSchema=new Schema({
label:{type:String,required:true,unique:true},
value:{type:String,required:true,unique: true},

})
const virtual=manufacturerSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
manufacturerSchema.set('toJSON',{
    virtuals:true,
    versionKey:false,
    transform:function(doc,ret){
        delete ret._id;
    }
})
exports.Manufecturer=mongoose.model('Manufecturer',manufacturerSchema);