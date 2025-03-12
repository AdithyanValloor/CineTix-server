import { User } from "../models/userModel.js";
import { generateToken } from "../utils/token.js";

// ADMIN USER CONTROLS 

// SIGNUP
export const signup = async (req, res) => {
    try {
        // Retreiving data from client
        const {name, email, password, phone} = req.body

        //data validation
        if (!name || !email || !password || !phone) return res.status(400).json({ message: "all fields required" });
       
        // Check if already exists
        const userExist = await User.findOne({email})
        if(userExist) return res.status(400).json({message: "User already exist"})

        // Save to database
        const newUser = new User({name, email, password, phone, role: 'admin'})
        await newUser.save()

        // Generate Token 
        const token = generateToken(newUser._id, "admin")
        console.log(token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
        res.json({data: newUser, message: "signup success"})

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
}

// LOGIN
export const login = async (req, res) => {
    try {
        // Retreiving data from client 
        const {email, password} = req.body 

        //data validation
        if (!email || !password) return res.status(400).json({ message: "all fields required" });

        // Check if user exists
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "Invalid email or password"})

        // Compare password
        const isMatch = await user.comparePassword(password)
        if(!isMatch) return res.status(400).json({message: "Invalid email or password"})

        // If the account is deactivated
        if(!user.isActive && user.deactivatedAt && new Date() < user.deleteAt){
            return res.json({message: `Your account is deactivated and set to deleted on ${user.deleteAt}`})
        }

        // Generate Token 
        const token = generateToken(user._id, user.role)

        // Set cookie and send user data 
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });

        res.json({data: user, message: "login successfull"})

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
} 

// Get all users 
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ data: users, message: "All users fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
};

// Deactivate user
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        // If already deactivated, do nothing
        if (user.isActive === false) return res.status(400).json({ message: "User is already deactivated" })

        const deleteAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        await User.findByIdAndUpdate(user._id, {
            $set: {
                deactivatedAt: new Date(),
                deleteAt,
                isActive: false
            }
        });

        res.json({message: "User account deactivated successfully"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// Delete user 
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        await user.deleteOne()
        res.json({message: "User account deleted successfully"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

