const jwt=require("jsonwebtoken")
const {JWT_SECRETE}=require("../jwttoken/config")
const {user}=require("../db/schema")

 const userexist=(req,res,next)=>{
 const token =req.headers.authorization
 if (!token || !token.startsWith('Bearer')){
    res.status(411).json({
        message: "invalid user"
    })
    return
 }
 const tokenindex=token.split(" ")
 const originaltoken=tokenindex[1]
 try{
    const verify=jwt.verify(originaltoken,JWT_SECRETE)
    const userexist=user.findOne({
        _id:verify.userid
    })
   
    if(userexist){ 
    req.userid =verify.userid
        next()
    }
    else{
        res.status(411).json({
            message: "invalid user2"
        })
    }
 }catch(e){
    console.log(e)
    res.status(411).json({
        message: "Error in validation"
    })
 }


}
module.exports={userexist}