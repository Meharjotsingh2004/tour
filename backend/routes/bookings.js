import express from "express";
import {
  createBooking,
  getAllBooking,
  getBooking, createOrder, verifyPayment , acceptBooking, rejectBooking, deleteBooking 
} from "../controllers/bookingController.js";

import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyUser, createBooking);
router.get("/:id", verifyUser, getBooking);
router.get("/", verifyAdmin, getAllBooking);
router.post("/create-order", verifyUser, createOrder);
router.post("/verify-payment", verifyUser, verifyPayment);

router.put("/accept/:id", verifyAdmin, acceptBooking);
router.put("/reject/:id", verifyAdmin, rejectBooking);
router.delete("/:id", verifyAdmin, deleteBooking);

export default router;
