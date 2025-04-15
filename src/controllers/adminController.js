import { Booking } from "../models/bookingsModel.js";
import { Movie } from "../models/moviesModel.js";
import { Theater } from "../models/theatersModel.js";
import { User } from "../models/userModel.js";
import { generateToken } from "../utils/token.js";

// ADMIN USER CONTROLS 

// ADMIN SIGNUP
export const signup = async (req, res) => {
    try {
        // Retrieving data from client
        const { firstName, lastName, email, password, mobile } = req.body;

        // Data validation
        if (!firstName || !lastName || !email || !password || !mobile ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if admin already exists
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ message: "Admin already exists" });

        // Create new admin user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            mobile,
            role: 'admin'
        });

        await newUser.save();

        // Generate Token 
        const token = generateToken(newUser._id, "admin");

        // Set cookie and send user data
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // expires in 7 days
        });

        res.json({ data: newUser, message: "Admin signup successful" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// ADMIN LOGIN
export const login = async (req, res) => {
    try {
        // Retrieving data from client 
        const { email, password } = req.body;

        // Data validation
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        // Check if admin exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // If the account is deactivated
        if (!user.isActive && user.deactivatedAt && new Date() < user.deleteAt) {
            return res.json({ message: `Your account is deactivated and set to be deleted on ${user.deleteAt}` });
        }

        // Generate Token 
        const token = generateToken(user._id, user.role);

        // Set cookie and send user data 
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // expires in 7 days
        });

        res.json({ data: user, message: "Admin login successful" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// Get all users 
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ data: users, message: "All users fetched" });
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message || "Internal server error"})
    }
};


// Admin dashboad stats
export const adminDashboard = async (req, res) => {
    try {
      // Total users (excluding exhibitors and admins)
      const totalUsers = await User.countDocuments({ role: 'user' });
  
      // Total exhibitors
      const totalExhibitors = await User.countDocuments({ role: 'exhibitor' });
  
      // Total theaters
      const totalTheaters = await Theater.countDocuments();
  
      // Total movies
      const totalMovies = await Movie.countDocuments();
  
      // Total bookings
      const totalBookings = await Booking.countDocuments();
  
      // Total revenue
      const totalRevenueAgg = await Booking.aggregate([
        {
          $match: { paymentStatus: 'paid' } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$totalPrice', 0.10] } },
          },
        },
      ]);
      const totalRevenue = totalRevenueAgg[0]?.total || 0;
      
  
      // Monthly revenue (current month only)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
  
      const monthlyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$totalPrice', 0.10] } },
          },
        },
      ]);
      const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
      
  
      // Weekly revenue (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      const weeklyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$totalPrice', 0.10] } },
          },
        },
      ]);
      const weeklyRevenue = weeklyRevenueAgg[0]?.total || 0;
      
  
      // Daily revenue for the past 7 days (for daily chart)
      const dailyRevenueAgg = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: { $multiply: ['$totalPrice', 0.10] } },
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
  
      // Monthly revenue for past 12 months (for monthly chart)
      const monthlyRevenueChartAgg = await Booking.aggregate([
        {
          $match: {
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: { $multiply: ['$totalPrice', 0.10] } },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]);
      
  
      const monthlyRevenueMap = {};
      monthlyRevenueChartAgg.forEach(entry => {
        const key = `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`;
        monthlyRevenueMap[key] = entry.total;
      });
  
      const monthlyLabels = [];
      const monthlyValues = [];
      const now = new Date();
  
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g. 'Apr 25'
        monthlyLabels.push(label);
        monthlyValues.push(monthlyRevenueMap[key] || 0);
      }
  
      // Final response
      res.status(200).json({
        totalUsers,
        totalExhibitors,
        totalTheaters,
        totalMovies,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        revenueChart: {
          labels,
          values,
        },
        monthlyRevenueChart: {
          labels: monthlyLabels,
          values: monthlyValues,
        },
      });
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ message: 'Server Error' });
    }
};


// Ban user
export const banUser = async (req, res) => {
  console.log("HITTING BAN WITH USER ID : ", req.params.id);

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { banType, durationInDays } = req.body; 

    let updatedUser;
    if (banType === "temporary") {
      // Perform temporary ban logic
      const newBanExpiryDate = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000); 
      updatedUser = await user.temporarilyBan(durationInDays); 
      updatedUser.banExpiry = newBanExpiryDate;
    } else {
      updatedUser = await user.permanentlyBan();
    }

    // Ensure that the response includes the correct updated user data
    res.json({
      updatedUser: { 
        _id: updatedUser._id, 
        isBanned: true, 
        banExpiry: updatedUser.banExpiry || null
       
      },
      message: banType === "temporary" 
        ? `User has been temporarily banned for ${durationInDays} days` 
        : `User has been permanently banned`
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

  
  // Unban User
export const unbanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.unban();
        return res.json({ message: "User has been unbanned successfully" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
  
// Deactivate User
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.isActive) return res.status(400).json({ message: "User is already deactivated" });

        const deleteAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months later

        await User.findByIdAndUpdate(user._id, {
        $set: {
            deactivatedAt: new Date(),
            deleteAt,
            isActive: false,
            isBanned: false, 
        },
        });

        res.json({ message: "User account deactivated successfully" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
  
// Delete User
export const deleteUser = async (req, res) => {

  console.log('Delete Hit');
  
    try {
        const user = await User.findById(req.params.id);
        
        if( user ) console.log("USER FOUND");
        

        if (!user) return res.status(404).json({ message: "User not found" });

        await user.deleteUser(); 
        res.json({ message: "User account deleted successfully" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

// Logout
export const logout = async (req, res) => {
    
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
