import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      url: { type: String },
      public_id: { type: String },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    savedCity: {
      type: String,
      trim: true,
      default: null,
    },    
    mobile: {
      type: String,
    },
    identity: {
      type: String,
    },
    pincode: {
      type: String,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    landmark: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "exhibitor", "admin"],
      default: "user",  
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    theatersOwned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater", 
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: { 
      type: Date, 
      default: null 
    },
    deleteAt: { 
      type: Date, 
      default: null 
    },
    isBanned: {
      type: Boolean,
      default: false, 
    },
    banType: {
      type: String,
      enum: ['temporary', 'permanent', null],
      default: null
    },
    banExpiry: { 
      type: Date, 
      default: null,  
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre('findOne', function() {
  this.populate('theatersOwned');
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if the user is temporarily banned and whether the ban has expired
UserSchema.methods.isTemporarilyBanned = function () {
  if (!this.isBanned) return false;
  // If the ban has expired, return false
  if (this.banExpiry && new Date() > this.banExpiry) {
    this.isBanned = false;
    this.banType = 'temporary'
    this.banExpiry = null;
    return false;
  }
  return true;
};

// Helper method to apply permanent ban
UserSchema.methods.permanentlyBan = async function () {
  console.log("HIT PER");
  
  this.isBanned = true;
  this.isActive = false;
  this.banType = 'permanent';
  this.banExpiry = null;
  return await this.save(); 
};


// Helper method to apply temporary ban
UserSchema.methods.temporarilyBan = async function (durationInDays) {
  console.log("HIT TEMP");
  
  this.isBanned = true;
  this.isActive = false;
  this.banType = 'temporary';
  this.banExpiry = new Date();
  this.banExpiry.setDate(this.banExpiry.getDate() + durationInDays); 
  return await this.save(); 
};


// Helper method to unban a user
UserSchema.methods.unban = async function () {
  this.isBanned = false;
  this.isActive = true;
  this.banExpiry = null;
  this.banType = null;
  return await this.save();
};

// Helper method to delete a user
UserSchema.methods.deleteUser = async function () {
  this.deleteAt = new Date();
  return await this.save();
};

const User = mongoose.model("User", UserSchema);

export { User };
