import jwt from "jsonwebtoken"
import { User } from "../models/userModel.js"

// Valid user auth
export const protect = async (req, res, next) => {
    try {

        // Get token from cookie or headers
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
       
        if(!token) return res.status(401).json({message: "No token, Autherization denied"})
            
        // Verify token 
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        
        // Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select("-password")

        if(!req.user) return res.status(401).json({message: "User not found"})
        
        next()

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

// Admin auth
export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only" });
    }
};

// Exhibitor auth
export const authorizeExhibitor = (req, res, next) => {
    if (req.user && req.user.role === "exhibitor") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Exhibitor only" });
    }
};