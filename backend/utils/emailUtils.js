import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "YOUR_EMAIL_HOST",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateBillHTML = (order, userEmail) => {
    const deliveryCharge = 20;
    const subtotal = order.amount - deliveryCharge;

    const itemsList = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #ff6347;">FoodiGO Order Confirmation & Bill</h2>
            <p>Dear Customer,</p>
            <p>Thank you for your order! Your payment was successful, and your order details are below.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Item</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Qty</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Sub Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">Delivery Charge:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${deliveryCharge.toFixed(2)}</td>
                    </tr>
                    <tr style="font-weight: bold; background-color: #ffe4e1;">
                        <td colspan="3" style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #ff6347;">Total Amount Paid:</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #ff6347;">₹${order.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <h3 style="margin-top: 30px;">Delivery Address</h3>
            <p><strong>Name:</strong> ${order.address.firstName} ${order.address.lastName}</p>
            <p><strong>Street:</strong> ${order.address.street}</p>
            <p><strong>City/State:</strong> ${order.address.city}, ${order.address.state}, ${order.address.zipcode}</p>
            <p><strong>Contact:</strong> ${order.address.phone}</p>
            <p style="margin-top: 20px;">Your order status is: **${order.status}**</p>
            <p>Thank you for shopping with FoodiGO!</p>
        </div>
    `;
};


export const sendEmailWithBill = async (email, order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `FoodiGO Order #${order._id.toString().slice(-6)} Confirmed - Your Bill`,
            html: generateBillHTML(order, email),
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending bill email:", error);
        return false;
    }
};