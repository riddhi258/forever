import userModel from "../modals/userModel.js"
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createToken =(id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}   

const loginUser = async (req,res) =>{
   try {
    const {email,password} = req.body;
    const user = await userModel.findOne({email})
    if(!user){
        return res.json({Success:false , message : "User doesn't exists"})
    }
    if(!validator.isEmail(email)){
        return res.json({Success:false , message : "Please enter a valid email"})
    }
    if(password.length < 6){    
        return res.json({Success:false , message : "Password must be at least 6 characters"})
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.json({Success:false , message : "Invalid credentials"})
    }

    const token = createToken(user._id)
    res.json({Success:true , token})    

   } catch (error) {
      console.log(error)
      res.json({Success:false , message : "Internal server error"})
   }
}

const registerUser = async (req,res) =>{
   try {
    const {name,email,password} = req.body
    if(!name || !email || !password){
        return res.json({ Success:false , message : "Please fill all the fields"})
    }
    const exists = await userModel.findOne({email})
    if(exists){
        return res.json({Success:false , message : "User already exists"})
    }
    if(!validator.isEmail(email)){
        return res.json({Success:false , message : "Please enter a valid email"})
    }
    if(password.length < 6){    
        return res.json({Success:false , message : "Password must be at least 6 characters"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = await userModel.create({
        name,
        email,
        password:hashedPassword
    })
    const user= await newUser.save()
    const token = createToken(user._id)
    res.json({Success:true , token})    

   } catch (error) {
      console.log(error)
      res.json({Success:false , message : "Internal server error"})
   }
}

const adminlogin = async (req,res) =>{
  try {
    const {email,password} = req.body
    if (email === process.env.ADMIN_EMAIL&&password === process.env.ADMIN_PASSWORD){
        const token = jwt.sign(email+password,process.env.JWT_SECRET);
        res.json({success:true , token})
    }
    else{
        res.json({success:false , message : "Invalid credentials"})
    }
    
  } catch (error) {
    
  }
}

export {loginUser,registerUser,adminlogin}