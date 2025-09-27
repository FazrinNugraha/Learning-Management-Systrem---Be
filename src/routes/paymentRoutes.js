import { handlePayment } from "../controllers/paymentController.js"
import express from "express"

const paymentRoutes = express.Router()

paymentRoutes.post("/handle-payment-midtrans", handlePayment)

export default paymentRoutes