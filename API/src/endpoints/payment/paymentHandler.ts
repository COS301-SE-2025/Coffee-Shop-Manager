import { Request, Response } from "express";
import PaymentService from "../../payment.service";

export async function initiatePaymentHandler(req: Request, res: Response): Promise<void> {
    try {
        const { orderNumber, total, customerInfo, returnUrl, cancelUrl } = req.body;

        // More specific validation
        if (!orderNumber) {
            res.status(400).json({
                success: false,
                message: "Order number is required"
            });
            return;
        }

        if (!total || total <= 0) {
            res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
            return;
        }

        if (!customerInfo?.name || !customerInfo?.email) {
            res.status(400).json({
                success: false,
                message: "Customer name and email are required"
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerInfo.email)) {
            res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
            return;
        }

        // Use the provided URLs if available, otherwise use default from env
        const finalReturnUrl = returnUrl || process.env.PAYFAST_RETURN_URL;
        const finalCancelUrl = cancelUrl || process.env.PAYFAST_CANCEL_URL;
        const notifyUrl = process.env.PAYFAST_NOTIFY_URL || `${process.env.NEXT_PUBLIC_API_URL}/payment/notify`;
        
        console.log("Return URL:", finalReturnUrl);
        console.log("Cancel URL:", finalCancelUrl);
        console.log("Notify URL:", notifyUrl);

        const paymentResult = await PaymentService.initiatePayment(
            orderNumber,
            total,
            customerInfo,
            finalReturnUrl,
            finalCancelUrl,
            notifyUrl
        );

        if (paymentResult.success) {
            res.status(200).json({
                success: true,
                paymentUrl: paymentResult.paymentUrl,
                orderId: orderNumber // Add orderId to response
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentResult.message || "Payment initiation failed"
            });
        }
    } catch (error: any) {
        console.error("Payment initiation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error during payment initiation"
        });
    }
}