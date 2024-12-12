

import Booking from "../models/Booking.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: 'rzp_test_jnFll4vBKCwPho',
  key_secret: 'rj1C0dsKibu56PiiOhUqdGFp',
});


export const createBooking = async (req, res) => {
  const newBooking = new Booking(req.body);
  try {
    const savedBooking = await newBooking.save();
    res.status(200).json({
      success: true,
      message: "Your tour is booked",
      data: savedBooking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const book = await Booking.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Successful",
      data: book
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get booking",
    });
  }
};


export const getAllBooking = async (req, res) => {
  try {
    const books = await Booking.find();
    res.status(200).json({
      success: true,
      message: "Successful",
      data: books
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: req.body.receipt,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};


export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  const isAuthentic = expectedSignature === razorpay_signature;
  if (isAuthentic) {
    const newBooking = new Booking({
      userId: req.body.userId,
      userEmail: req.body.userEmail,
      tourName: req.body.tourName,
      fullName: req.body.fullName,
      phone: req.body.phone,
      guestSize: req.body.guestSize,
      bookAt: req.body.bookAt,
    });
    try {
      const savedBooking = await newBooking.save();
      res.status(200).json({
        success: true,
        message: "Payment verified and booking created successfully",
        data: savedBooking,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Payment verified but failed to create booking",
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
};


export const acceptBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      data: updatedBooking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to accept booking",
    });
  }
};


export const rejectBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: updatedBooking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reject booking",
    });
  }
};


export const deleteBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};
