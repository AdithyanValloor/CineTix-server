import { User } from "../models/userModel.js";
import { generateToken } from "../utils/token.js";
import {Theater} from '../models/theatersModel.js';
import {Show} from '../models/showsModel.js';
import {Booking} from '../models/bookingsModel.js';

// Register
export const registerExhibitor = async (req, res) => {
    try {

        // Get exhibitor data
        const {firstName, lastName, email, password, mobile, company} = req.body
        
        if(!firstName|| !lastName || !email || !password || !mobile || !company) return res.status(400).json({message: "All fields are required"})

        // Check if exhibitor already registered
        const exists = await User.findOne({ email })
        if(exists) return res.status(400).json({message: "Exhibitor already exists"})

        // Create exhibitor
        const exhibitor = new User({firstName, lastName, email, password, mobile, company, role: "exhibitor"})

        await exhibitor.save()

        // Create token 
        const token = generateToken(exhibitor._id, "exhibitor")

        // Set cookie and send data
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
        res.json({data: exhibitor, message: "Exhibitor registration successful"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// Login
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
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });

        console.log(exhibitor);
        

        res.json({data: exhibitor, message: "Exhibitor login successful"})


    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
}

// Get profile
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

// Get Dashboard
export const getDashboardStats = async (req, res) => {
    try {
      const exhibitorId = req.user._id;
  
      const totalTheaters = await Theater.countDocuments({ exhibitor: exhibitorId });
  
      const now = new Date();

      const shows = await Show.find({ exhibitor: exhibitorId });

      const upcomingShows = shows.filter(show => {
      const showDateTime = new Date(`${show.date.toISOString().split('T')[0]}T${show.time}`);
      return showDateTime >= now;
      }).length;

  
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
  
      const todaysBookings = await Booking.countDocuments({
        exhibitor: exhibitorId,
        createdAt: { $gte: startOfToday, $lte: endOfToday },
      });
  
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      const weeklyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            exhibitor: exhibitorId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' },
          },
        },
      ]);
      const weeklyRevenue = weeklyRevenueAgg[0]?.total || 0;
  
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
  
      const monthlyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            exhibitor: exhibitorId,
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' },
          },
        },
      ]);
      const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  
      const totalRevenueAgg = await Booking.aggregate([
        {
          $match: { exhibitor: exhibitorId },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' },
          },
        },
      ]);
      const totalRevenue = totalRevenueAgg[0]?.total || 0;

      const dailyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            exhibitor: exhibitorId,
            createdAt: { $gte: sevenDaysAgo, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      
      const dailyRevenueMap = {};
      dailyRevenueAgg.forEach(entry => {
        dailyRevenueMap[entry._id] = entry.total;
      });
      
      const labels = [];
      const values = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const day = date.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon'
        labels.push(day);
        values.push(dailyRevenueMap[key] || 0);
      }
      
  
      res.status(200).json({
        totalTheaters,
        upcomingShows,
        todaysBookings,
        weeklyRevenue,
        monthlyRevenue,
        totalRevenue,
        revenueChart: {
            labels,
            values,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server Error' });
    }
};


// Get all bookings
export const getExhibitorBookings = async (req, res) => {
    try {
      const exhibitorId = req.user._id;
  
      // Step 1: Get shows by this exhibitor
      const exhibitorShows = await Show.find({ exhibitor: exhibitorId }).select("_id");
      const showIds = exhibitorShows.map(show => show._id);
  
      // Step 2: Find bookings for these shows
      const bookings = await Booking.find({ show: { $in: showIds } })
        .populate('user', 'firstName lastName') 
        .populate({
          path: 'show',
          populate: [
            { path: 'movie', select: 'title' },
            { path: 'theater', select: 'name' }
          ]
        })
        .populate({
            path: 'seats',
            select: 'seat price'  
        });
  
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching exhibitor bookings:', error);
      res.status(500).json({ message: 'Server Error' });
    }
};
  
  


// Update profile
export const updateExhibitorProfile = async (req, res) => {
    try {

        // Get datas
        const {firstName, lastName, email, oldPassword, newPassword, mobile, company} = req.body

        // Verify user is authenticated
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})

        // Retrieve exhibitor data from database 
        const  exhibitor = await User.findById(req.user.id)

        if(!exhibitor) return res.status(401).json({message: "User not found"})

        // Update data
        if(firstName) exhibitor.firstName = firstName
        if(lastName) exhibitor.lastName = lastName
        if(email) exhibitor.email = email
        if(mobile) exhibitor.mobile = mobile
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

// LOGOUT
export const logout = async (req, res) => {
    
    console.log("LOGOUT HIt");
    

    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None"
        });

        res.status(200).json({ message: "User logout successful" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
