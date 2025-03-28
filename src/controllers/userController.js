import { User } from "../models/userModel.js"
import { generateToken } from "../utils/token.js"

// SIGNUP
export const signup = async (req, res) => {
    try {
        // Retreiving data from client
        const {name, email, password, phone} = req.body

        //data validation
        if (!name || !email || !password ) return res.status(400).json({ message: "all fields required" });
       
        // Check if already exists
        const userExist = await User.findOne({email})
        if(userExist) return res.status(400).json({message: "User already exist"})

        // Save to database
        const newUser = new User({name, email, password, phone})
        await newUser.save()

        // Generate Token 
        const token = generateToken(newUser._id, "user")
    
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });

        {
            const {password, ...userData} = newUser.toObject()
            res.json({data: userData, message: "signup success"})

            console.log("User Data :", userData);
            
        }


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

        {
            const {password, ...userData} = user.toObject()
            res.json({data: userData, message: "login success"})

            console.log("User Data :", userData);
        }

        // res.json({data: user, message: "login successfull"})

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
} 

// GET PROFILE
export const getProfile = async (req, res) => {
    try {

        // Ensure user is authenticated
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})
        
        // Retrieve user data from database excluding password
        const userData = await User.findById(req.user.id).select("-password")

        // Check if user exists
        if(!userData) return res.status(400).json({message: "User not found"})

        res.status(200).json({ data: userData, message: "User profile fetched" })

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const { name, email, oldPassword, newPassword, phone } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized access" });

        // Retrieve user from database
        const userData = await User.findById(req.user.id);
        if (!userData) return res.status(404).json({ message: "User not found" });

        // Update details
        if (name) userData.name = name;
        if (email) userData.email = email;
        if (phone) userData.phone = phone;

        // Handle profile picture upload (Cloudinary URL)
        if (req.file) {
            userData.profilePicture = req.file.path; // Cloudinary provides a URL in req.file.path
        }

        // Update password (if provided)
        if (oldPassword && newPassword) {
            const isMatch = await userData.comparePassword(oldPassword);
            if (!isMatch) return res.status(400).json({ message: "Incorrect password" });
            userData.password = newPassword;
        }

        // Save changes
        await userData.save();

        res.json({ data: userData, message: "User profile updated successfully" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


// DEACTIVATE ACCOUNT
export const deactivateProfile = async (req, res) => {
    try {
        // Ensure user is authenticated 
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})

        // Set deactivation date to now
        const deleteAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                deactivatedAt: new Date() , 
                deleteAt,
                isActive: false
            }
        );

        // Clear cookie
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0) 
        });
        
        res.json({ message: "Your account has been deactivated. You can reactivate it within 3 months."})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// REACTIVATE ACCOUNT
export const reactivateAccount = async (req, res) => {
    try {
        
        const { email } = req.body

        const user = await User.findOne({email})
        
        // Check if user exists
        if(!user) return res.status(401).json({message: "User not found"})
        
        // If user is deactivated and if the deletion time is not exeeded, reactivate
        if (!user.isActive && user.deleteAt && new Date() < user.deleteAt) {
            await User.findByIdAndUpdate(user._id, {
                isActive: true,
                deactivatedAt: null,
                deleteAt: null
            });

            const newToken = generateToken(user._id, "user");
            res.cookie("token", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
    
            return res.json({ message: "Your account has been reactivated!", data: user });
        }

        return res.json({ message: "Your account is already activate", data: user });

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
    try {
        
        // Ensure user is authenticated 
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})

        // Account deletion time 
        const deleteAt = new Date()
        deleteAt.setDate(deleteAt.getDate() + 14)

        // Delete user from database
        await User.findByIdAndUpdate(
            req.user.id, 
            { 
                deactivatedAt: new Date() , 
                deleteAt,
                isActive:false
            }
        )

        // Clear cookie
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0) 
        });
        
        res.json({ message: `Your account will be permanently deleted on ${deleteAt}. You can reactivate before then.` });

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// LOGOUT
export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
    
        res.json({message: "User logout success"})
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

