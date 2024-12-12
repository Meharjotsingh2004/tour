import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const otpCache = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(email, otp) {
  const mailOptions = {
    from: 'goelmedha05@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for verification is: ${otp}`
  };

  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'goelmedha05@gmail.com',
      pass: 'nnes mznl gyql jfrq'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred:', error);
    } else {
      console.log('OTP Email sent successfully:', info.response);
    }
  });
}

export const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    otpCache[email] = otp;

    sendOTP(email, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const login = async (req, res) => {
  const { email, password, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const checkCorrectPassword = await bcrypt.compare(password, user.password);

    if (!checkCorrectPassword) {
      return res.status(401).json({ success: false, message: "Incorrect email or password" });
    }

    if (!otpCache[email] || otpCache[email] !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    delete otpCache[email];

    const { password: userPassword, role, ...rest } = user._doc;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json({
        token,
        data: { ...rest },
        role,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const register = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      photo: req.body.photo,
    });

    await newUser.save();

    res.status(200).json({ success: true, message: "Successfully Created" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create. Try again" });
  }
};

