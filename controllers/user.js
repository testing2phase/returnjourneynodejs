import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";
import { sendOtp } from "../utils/sendOtp.js";

import requestIP from "request-ip";

import { IPinfoWrapper } from "node-ipinfo";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const ipAddress = requestIP.getClientIp(req);

    const ipinfo = new IPinfoWrapper(process.env.IPINFOTOk);

    const userIpinfo = await ipinfo.lookupIp(ipAddress);

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 400));

    user.lastLoginDetails = user.currentLoginDetails;
    user.currentLoginDetails = userIpinfo;

    await user.save();

    sendCookie(user, res, `Welcome back, ${user.email}`, 200);
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, mobile } = req.body;

    const ipAddress = requestIP.getClientIp(req);

    const ipinfo = new IPinfoWrapper(process.env.IPINFOTOk);

    const userIpinfo = await ipinfo.lookupIp(ipAddress);

    let user = await User.findOne({ email });

    const mobilee = await User.findOne({ mobile });

    if (user)
      return next(new ErrorHandler("User Already Exist with this mail", 400));

    if (mobilee)
      return next(
        new ErrorHandler(
          "A User is already registered with this mobile No.",
          400
        )
      );

    if (password.length < 6)
      return next(new ErrorHandler("User Already Exist with this mail", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(Math.random() * 1000000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    user = await User.create({
      email,
      password: hashedPassword,
      mobile,
      currentLoginDetails: userIpinfo,
      otp: hashedOtp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });

    await sendOtp(mobile, otp);

    sendCookie(user, res, "Otp sent to your mobile number", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "development" ? false : true,
      })
      .json({
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch || user.otp_expiry < Date.now()) {
      return next(new ErrorHandler("Invalid OTP or has been Expired", 400));
    }

    user.varified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendCookie(user, res, "Account Verified", 200);
  } catch (error) {
    next(error);
  }
};
