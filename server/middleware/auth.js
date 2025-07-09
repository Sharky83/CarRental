import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.json({success: false, message: "not authorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.json({success: false, message: "not authorized"})
        }
        const userId = decoded
        req.user = await User.findById(userId).select("-password")
        next();
    } catch (error) {
        return res.json({success: false, message: "not authorized"})
    }
}