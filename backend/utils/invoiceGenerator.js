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
               .fillColor('#06b6d4')
               .text('MISHRA MART', 50, 50)
               .fillColor('#000000')
               .fontSize(10)
               .text('INVOICE', 50, 80);

            // Order Details
            doc.fontSize(12)
               .text(`Order ID: ${order.orderId}`, 50, 120)
               .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 140)
               .text(`Status: ${order.status.toUpperCase()}`, 50, 160);

            // Customer Details
            doc.text('Shipping Address:', 50, 200)
               .text(order.shippingAddress.name, 50, 220)
               .text(order.shippingAddress.address, 50, 240)
               .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 260)
               .text(`Phone: ${order.shippingAddress.phone}`, 50, 280)
               .text(`Email: ${order.shippingAddress.email}`, 50, 300);

            // Items Table Header
            let yPosition = 350;
            doc.fontSize(10)
               .fillColor('#06b6d4')
               .text('Item', 50, yPosition)
               .text('Quantity', 250, yPosition)
               .text('Price', 350, yPosition)
               .text('Total', 450, yPosition)
               .fillColor('#000000');

            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

            // Items
            order.items.forEach((item) => {
                yPosition += 20;
                const productName = item.productId?.name || 'Product';
                const quantity = item.quantity;
                const price = item.price;
                const total = price * quantity;

                doc.text(productName.substring(0, 30), 50, yPosition)
                   .text(quantity.toString(), 250, yPosition)
                   .text(`₹${price}`, 350, yPosition)
                   .text(`₹${total}`, 450, yPosition);
            });

            // Total
            yPosition += 40;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 20;
            doc.fontSize(12)
               .fillColor('#06b6d4')
               .text('Total Amount:', 350, yPosition)
               .text(`₹${order.totalAmount}`, 450, yPosition)
               .fillColor('#000000');

            // Footer
            yPosition += 60;
            doc.fontSize(8)
               .fillColor('#666666')
               .text('Thank you for shopping with Mishra Mart!', 50, yPosition)
               .text('For any queries, contact: support@mishramart.com', 50, yPosition + 15);

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};