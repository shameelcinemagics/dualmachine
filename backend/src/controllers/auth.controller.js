const axios = require('axios');
const adminPin = process.env.ADMIN_PIN
exports.verifyPin = (req,res)=>{
    const {pin} = req.body;
    console.log(pin)
    if(pin === adminPin){
        return res.status(200).json({success:true});
    } else {
        return res.status(401).json({error:"invalid pin"})
    }
};