import { User } from "../models/userModel.js";
import { generateToken } from "../utils/token.js";
import {Theater} from '../models/theatersModel.js';
import {Show} from '../models/showsModel.js';
import {Booking} from '../models/bookingsModel.js';
import moment from "moment";

// Register
export const registerExhibitor = async (req, res) => {
  try {
      const { firstName, lastName, email, password, mobile, company } = req.body;

      if (!firstName || !lastName || !email || !password || !mobile || !company)
          return res.status(400).json({ message: "All fields are required" });

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Exhibitor already exists" });

      // Create exhibitor with default approval state
      const exhibitor = new User({
          firstName,
          lastName,
          email,
          password,
          mobile,
          company,
          role: "exhibitor",
          isApproved: false,               
          approvalStatus: "pending"       
      });

      await exhibitor.save();

      res.status(201).json({ message: "Exhibitor registration successful. Awaiting admin approval." });

  } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
}

// Login
export const loginExhibitor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exhibitor = await User.findOne({ email });
    if (!exhibitor)
      return res.status(400).json({ message: "Invalid email or password" });

    const isValid = await exhibitor.comparePassword(password);
    if (!isValid)
      return res.status(400).json({ message: "Invalid email or password" });

    // Check if role is exhibitor
    if (exhibitor.role === "exhibitor") {
      if (exhibitor.approvalStatus === "pending") {
        return res.status(403).json({
          message: "Your account is pending admin approval. Please wait for confirmation.",
        });
      }

      if (exhibitor.approvalStatus === "rejected") {
        return res.status(403).json({
          message: "Your registration has been rejected by the admin.",
        });
      }
    }

    const token = generateToken(exhibitor._id, "exhibitor");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ data: exhibitor, message: "Exhibitor login successful" });

  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Get profile
export const getExhibitorProfile = async (req, res) => {
    try {
        // Verify user
        if(!req.user || !req.user.id) return res.status(400).json({message:"Unauthorised access"})

        // Check user 
        const exhibitorData = await User.findById(req.user.id).populate({
          path: 'theatersOwned',
          select: 'name location rows columns',
          populate: {
              path: 'exhibitor',
              select: 'firstName lastName'
          }
      });
        
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
    const now = new Date();

    const totalTheaters = await Theater.countDocuments({ exhibitor: exhibitorId });

    const shows = await Show.find({ exhibitor: exhibitorId });

    const upcomingShows = shows.filter(show => {
      const showDateTime = new Date(`${show.date.toISOString().split('T')[0]}T${show.time}`);
      return showDateTime >= now;
    }).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Filtered today's bookings with 'paid' status
    const todaysBookings = await Booking.countDocuments({
      exhibitor: exhibitorId,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      paymentStatus: 'paid',
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregation for Weekly Revenue with 'paid' status
    const weeklyRevenueAgg = await Booking.aggregate([
      {
        $match: {
          exhibitor: exhibitorId,
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'paid',
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

    // Aggregation for Monthly Revenue with 'paid' status
    const monthlyRevenueAgg = await Booking.aggregate([
      {
        $match: {
          exhibitor: exhibitorId,
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'paid', 
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

    // Aggregation for Total Revenue with 'paid' status
    const totalRevenueAgg = await Booking.aggregate([
      {
        $match: {
          exhibitor: exhibitorId,
          paymentStatus: 'paid', 
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Aggregation for Daily Revenue with 'paid' status
    const dailyRevenueAgg = await Booking.aggregate([
      {
        $match: {
          exhibitor: exhibitorId,
          createdAt: { $gte: sevenDaysAgo, $lte: now },
          paymentStatus: 'paid', 
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

    // Return the updated stats
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

// Get Theater analytics
export const getTheaterAnalytics = async (req, res) => {
  try {
    const exhibitorId = req.user._id;
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const theaters = await Theater.find({ exhibitor: exhibitorId });
    const theaterIds = theaters.map((t) => t._id);

    const shows = await Show.find({ theater: { $in: theaterIds } });
    const showIds = shows.map((s) => s._id);

    const bookings = await Booking.find({
      show: { $in: showIds },
      paymentStatus: "paid",
    }).populate("show");

    const totalBookings = bookings.length;

    // Calculate seats booked & available for occupancy rate
    let totalSeatsBooked = 0;
    let totalSeatsAvailable = 0;

    bookings.forEach((b) => {
      totalSeatsBooked += b.seats.length;
    });

    shows.forEach((s) => {
      const rows = s?.seatLayout?.rows || 0;
      const cols = s?.seatLayout?.columns || 0;
      totalSeatsAvailable += rows * cols;
    });

    const occupancyRate = totalSeatsAvailable
      ? Math.round((totalSeatsBooked / totalSeatsAvailable) * 100)
      : 0;

    // Monthly revenue (from bookings in current month)
    const monthlyRevenue = bookings
      .filter((b) => {
        const created = new Date(b.createdAt);
        return created >= startOfMonth && created <= endOfMonth;
      })
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Shows this month
    const showsThisMonth = shows.filter((s) => {
      const showDate = new Date(s.date);
      return showDate >= startOfMonth && showDate <= endOfMonth;
    }).length;

    return res.status(200).json({
      totalBookings,
      occupancyRate,
      monthlyRevenue,
      showsThisMonth,
    });
  } catch (err) {
    console.error("Theater analytics error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get Revenue Reports
export const getRevenueReports = async (req, res) => {
  try {
    const exhibitorId = req.user._id;

    const bookings = await Booking.find({ exhibitor: exhibitorId, paymentStatus: 'paid' })
      .populate('show') // get show time, date, movie, theater
      .populate({
        path: 'show',
        populate: ['theater', 'movie']
      });

    const report = bookings.map((booking, index) => ({
      id: index + 1,
      date: booking.createdAt.toISOString().split('T')[0],
      theater: booking.show.theater?.name || 'N/A',
      movie: booking.show.movie?.title || 'N/A',
      time: booking.show.time,
      tickets: booking.seats.length,
      total: booking.totalPrice
    }));

    res.status(200).json(report);
  } catch (error) {
    console.error('Revenue report error:', error);
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
