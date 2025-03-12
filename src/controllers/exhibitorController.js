import { User } from "../models/userModel.js";
import { generateToken } from "../utils/token.js";


export const registerExhibitor = async (req, res) => {
    try {

        // Get exhibitor data
        const {name, email, password, phone, company} = req.body
        
        if(!name || !email || !password || !phone || !company) return res.status(400).json({message: "All fields are required"})

        // Check if exhibitor already registered
        const exists = await User.findOne({ email })
        if(exists) return res.status(400).json({message: "Exhibitor already exists"})

        // Create exhibitor
        const exhibitor = new User({name, email, password, phone, company, role: "exhibitor"})

        await exhibitor.save()

        // Create token 
        const token = generateToken(exhibitor._id, "exhibitor")

        // Set cookie and send data
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
        res.json({data: exhibitor, message: "Exhibitor registration successful"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

export const loginExhibitor = async (req, res) => {
    try {

        // Get login data
        const {email, password} = req.body
        if(!email || !password) return res.status(400).json({message: "All fields are required"})

        const exhibitor = await User.findOne({email})
        if(!exhibitor) return res.status(400).json({message: "Invalid email or password"})

        // Compare password 
        const isValid = await exhibitor.comparePassword(password)
        if(!isValid) return res.status(400).json({message: "Invalid email or password"})

        // Create token 
        const token = generateToken(exhibitor._id, "exhibitor")

        // Set cookie and send data
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
        res.json({data: exhibitor, message: "Exhibitor login successful"})


    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

export const getExhibitorProfile = async (req, res) => {
    try {
        // Verify user
        if(!req.user || !req.user.id) return res.status(400).json({message:"Unauthorised access"})

        // Check user 
        const exhibitorData = await User.findById(req.user.id)
        
        if(!exhibitorData) return res.status(400).json({message: "User not found"})

        res.json({data: exhibitorData, message: "Exhibitor profile fetched" })

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

export const updateExhibitorProfile = async (req, res) => {
    try {

        // Get datas
        const {name, email, oldPassword, newPassword, phone, company} = req.body

        // Verify user is authenticated
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})

        // Retrieve exhibitor data from database 
        const  exhibitor = await User.findById(req.user.id)

        if(!exhibitor) return res.status(401).json({message: "User not found"})

        // Update data
        if(name) exhibitor.name = name
        if(email) exhibitor.email = email
        if(phone) exhibitor.phone = phone
        if(company) exhibitor.company = company
        
        if(oldPassword && newPassword){
            const isMatch = await exhibitor.comparePassword(oldPassword)
            if(!isMatch) return res.status(400).json({message: "Incorrect password"})
                exhibitor.password = newPassword
        }

        // Save updates
        await exhibitor.save()

        res.json({ data: exhibitor, message: "Exhibitor profile updated successfully"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

