const jwt = require("jsonwebtoken");

const auth=(req,res,next)=>{
    const authHeader=req.header("Authorization");
    const token=authHeader && authHeader.split(" ")[1];
    if(!token) return res.status(401).json({isLoggedIn:false,message:"No Token"});
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(403).json({ isLoggedIn: false, message: "Token invalid or expired" });
    }
};
module.exports = auth;
