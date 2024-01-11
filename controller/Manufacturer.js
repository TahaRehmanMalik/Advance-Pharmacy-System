
const {Manufecturer}=require('../modal/Manufacturer')
exports.fetchManufecturers=async(req,res)=>{
    try {
        const manufacturers=await Manufecturer.find({}).exec();
        res.status(200).json(manufacturers);
    } catch (error) {
        res.status(400).json(error);
    }
}
exports.createManufecturer=async(req,res)=>{
   
    const manufecturer=new Manufecturer(req.body)
   try {
 const doc=await manufecturer.save();
    res.status(201).json(doc);
   } catch (error) {
    res.status(400).json(error);
   }

}