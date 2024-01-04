const jwt=require("jsonwebtoken");
const User=require('../models/userModel');
const asyncHandler=require("express-async-handler");

const protect=asyncHandler(async (req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token=req.headers.authorization.split(" ")[1];

            const decode = jwt.verify(token, process.env.JWT_KEY);

            req.user = await User.findById(decode.userId,{password:0});
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }
    else
    res.send("Not authorized, no token");

})
module.exports={protect};