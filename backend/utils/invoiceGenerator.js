import PDFDocument from 'pdfkit';

export const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20)
               .text('MISHRA MART', 50, 50)
               .fontSize(10)
               .text('Invoice', 50, 80);

            // Order Details
            doc.fontSize(12)
               .text(`Order ID: ${order.orderId}`, 50, 120)
               .text(`Order Date: ${order.createdAt.toLocaleDateString()}`, 50, 140)
               .text(`Status: ${order.status}`, 50, 160);

            // Customer Details
            doc.text('Shipping Address:', 50, 200)
               .text(order.shippingAddress.name, 50, 220)
               .text(order.shippingAddress.address, 50, 240)
               .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 260)
               .text(`Phone: ${order.shippingAddress.phone}`, 50, 280);

            // Items Table Header
            let yPosition = 320;
            doc.fontSize(10)
               .text('Item', 50, yPosition)
               .text('Quantity', 250, yPosition)
               .text('Price', 350, yPosition)
               .text('Total', 450, yPosition);

            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

            // Items
            order.items.forEach((item, index) => {
                yPosition += 20;
                doc.text(item.productId.name, 50, yPosition)
                   .text(item.quantity.toString(), 250, yPosition)
                   .text(`₹${item.price}`, 350, yPosition)
                   .text(`₹${item.price * item.quantity}`, 450, yPosition);
            });

            // Total
            yPosition += 40;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 20;
            doc.fontSize(12)
               .text('Total Amount:', 350, yPosition)
               .text(`₹${order.totalAmount}`, 450, yPosition);

            // Footer
            yPosition += 60;
            doc.fontSize(8)
               .text('Thank you for shopping with Mishra Mart!', 50, yPosition)
               .text('For any queries, contact: support@mishramart.com', 50, yPosition + 15);

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};