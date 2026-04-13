require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= RAZORPAY INIT ================= */
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= CREATE ORDER ================= */
app.post("/create-order", async (req, res) => {

    try {
        const { amount } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "rcpt_" + Date.now()
        });

        res.json(order);
    } catch (err) {
        res.status(500).send("Error creating order");
    }
});

/* ================= VERIFY PAYMENT ================= */
app.post("/verify-payment", (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

/* ================= START SERVER ================= */
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});