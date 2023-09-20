import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    required: true,
    type: String,
    select: false,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  currentLoginDetails: {
    type: Array,
    default: [],
  },
  lastLoginDetails: {
    type: Array,
    default: [],
  },
  otp: {
    type: String,
  },
  varified: {
    type: Boolean,
    default: false,
  },
  otp_expiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model("User", schema);
