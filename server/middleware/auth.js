import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.json({success: false, message: "not authorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded || !decoded.id){
            return res.json({success: false, message: "not authorized"})
        }
        const userId = decoded.id  // Extract id from decoded token
        req.user = await User.findById(userId).select("-password")
        if (!req.user) {
            return res.json({success: false, message: "User not found"})
        }
        next();
    } catch (error) {
        return res.json({success: false, message: "not authorized"})
    }
}