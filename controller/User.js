const { User } = require("../modal/User")


exports.fetchUserById=async(req,res)=>{
    const {id}=req.user;
    try {
      const user=await User.findById(id);
      console.log("The user is ",user)
      res.status(200).json({id:user.id,addresses:user.addresses,username:user.username,email:user.email,role:user.role});  
    } catch (error) {
       res.status(400).json(error) 
    }
}
exports.updateUser=async(req,res)=>{
    const {id}=req.params;
    try {
        const user=await User.findByIdAndUpdate(id,req.body,{new:true});
        res.status(200).json(user);  
    } catch (error) {
        res.status(400).json(error)   
    }
}