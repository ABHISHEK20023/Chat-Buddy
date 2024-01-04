const asyncHandler=require('express-async-handler');
const jwt=require('jsonwebtoken')

const User = require('../models/userModel');
const registerUser=asyncHandler(async(req,res)=>{
const {name,email,password,pic}=req.body;

if(!name || !email || !password){
    res.status(400);
    throw new Error("Please Enter all the Feilds")
}


const userExists=await User.findOne({email})

if(userExists){
    res.status(400);
    throw new Error("User already exists")
}

const user=await User.create({
    name,email,password,pic
})

await user.save();
const token=generateToken(user._id);
if(user){
    res.status(201).json({...user._doc,token});
}
else{
    res.status(400);
    throw new Error("Failed to create user")
}

})

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);

        res.json({...user._doc,token});
    }
    else {
        res.status(401);
        throw new Error("Invalid credentials")
    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword=req.query.search ? {$or:[
        { name: { $regex: req.query.search,$options:'i'}},
        { email: { $regex: req.query.search, $options: 'i' } }
       ]
    }:{}; 
    const users = await User.find({ $and: [{_id:{$ne:req.user._id}},keyword ]})
    // console.log(users)
    res.send(users);
})

const generateToken=(userId)=>{
    return jwt.sign({ userId },process.env.JWT_KEY,{
        expiresIn:"1y"
    })
}

module.exports = { registerUser, authUser, allUsers } 