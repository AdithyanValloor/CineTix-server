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
      type: String
    },
    dateOfBirth: {
      type: Date,
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

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export { User };
