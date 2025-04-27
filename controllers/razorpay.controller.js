const Razorpay = require('razorpay');

module.exports = {
    getQRCode: async (req, res) => {
        try {
            const { fare } = req.body;
            const instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            console.log({instance})

            const qr = await instance.qrCode.create({
                type: "upi_qr",
                name: "IDSA",
                usage: "single_use",
                fixed_amount: true,
                payment_amount: fare * 100,
                description: "Scan to pay to IDSA",
                notes: {
                    purpose: "Flexible UPI Payment",
                },
            });

            return res.status(200).json({
                success: true,
                error: false,
                data: {
                    image: qr?.image_url,
                    id: qr.id
                }
            });
        } catch (err) {
            console.error("QR Code Generation Error:", err);
            return res.status(500).json({
                success: false,
                error: true,
                message: err.message,
            });
        }
    },
};
