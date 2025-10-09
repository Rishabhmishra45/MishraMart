import PDFDocument from 'pdfkit';

export const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                margin: 30,
                size: 'A4',
                bufferPages: true
            });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Calculate amounts
            const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
            const tax = subtotal * 0.18;
            const shipping = 50;
            const total = order.totalAmount || (subtotal + tax + shipping);

            // Header with modern design
            doc.fillColor('#06b6d4')
               .rect(0, 0, doc.page.width, 100)
               .fill();
            
            // Company Logo Area
            doc.fillColor('#ffffff')
               .rect(35, 20, 50, 50)
               .fill();
            
            doc.fillColor('#06b6d4')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('MM', 45, 35);
            
            // Company Name
            doc.fillColor('#ffffff')
               .fontSize(20)
               .font('Helvetica-Bold')
               .text('MISHRA MART', 100, 25);
            
            doc.fillColor('#e0f2fe')
               .fontSize(9)
               .font('Helvetica')
               .text('Your Trusted Shopping Partner', 100, 50);

            // Invoice Header
            doc.fillColor('#ffffff')
               .fontSize(18)
               .font('Helvetica-Bold')
               .text('INVOICE', 400, 25, { align: 'right' });
            
            doc.fontSize(9)
               .text(`Invoice #: ${order.orderId}`, 400, 50, { align: 'right' })
               .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 65, { align: 'right' });

            // Company and Customer Details
            const detailsY = 120;
            
            // Company Details
            doc.fillColor('#000000')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('FROM:', 35, detailsY);
            
            doc.font('Helvetica')
               .fontSize(9)
               .text('MISHRA MART', 35, detailsY + 15)
               .text('123 Business Avenue, Tech Park', 35, detailsY + 30)
               .text('Mumbai, Maharashtra - 400001', 35, detailsY + 45)
               .text('Phone: +91 98765 43210', 35, detailsY + 60)
               .text('Email: support@mishramart.com', 35, detailsY + 75)
               .text('GSTIN: 27AABCU9603R1ZM', 35, detailsY + 90);

            // Customer Details
            doc.font('Helvetica-Bold')
               .text('BILL TO:', 280, detailsY);
            
            doc.font('Helvetica')
               .text(order.shippingAddress.name, 280, detailsY + 15)
               .text(order.shippingAddress.address, 280, detailsY + 30, { width: 250 })
               .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 280, detailsY + 45, { width: 250 })
               .text(`Phone: ${order.shippingAddress.phone}`, 280, detailsY + 60)
               .text(`Email: ${order.shippingAddress.email}`, 280, detailsY + 75);

            // Invoice Details in Cards
            const cardsY = detailsY + 110;
            const cardWidth = 115;
            const cardHeight = 40;
            const cardGap = 15;
            
            // Invoice Number Card
            doc.fillColor('#f0f9ff')
               .rect(35, cardsY, cardWidth, cardHeight)
               .fill();
            
            doc.fillColor('#0369a1')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text('INVOICE NUMBER', 45, cardsY + 8);
            
            doc.fillColor('#000000')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(order.orderId, 45, cardsY + 22, { width: 95 });

            // Invoice Date Card
            doc.fillColor('#f0f9ff')
               .rect(35 + cardWidth + cardGap, cardsY, cardWidth, cardHeight)
               .fill();
            
            doc.fillColor('#0369a1')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text('INVOICE DATE', 45 + cardWidth + cardGap, cardsY + 8);
            
            doc.fillColor('#000000')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(new Date(order.createdAt).toLocaleDateString('en-IN'), 45 + cardWidth + cardGap, cardsY + 22);

            // Order Date Card
            doc.fillColor('#f0f9ff')
               .rect(35 + (cardWidth + cardGap) * 2, cardsY, cardWidth, cardHeight)
               .fill();
            
            doc.fillColor('#0369a1')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text('ORDER DATE', 45 + (cardWidth + cardGap) * 2, cardsY + 8);
            
            doc.fillColor('#000000')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(new Date(order.createdAt).toLocaleDateString('en-IN'), 45 + (cardWidth + cardGap) * 2, cardsY + 22);

            // Payment Method Card
            doc.fillColor('#f0f9ff')
               .rect(35 + (cardWidth + cardGap) * 3, cardsY, cardWidth, cardHeight)
               .fill();
            
            doc.fillColor('#0369a1')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text('PAYMENT METHOD', 45 + (cardWidth + cardGap) * 3, cardsY + 8);
            
            doc.fillColor('#000000')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment', 
                    45 + (cardWidth + cardGap) * 3, cardsY + 22, { width: 95 });

            // Order Status & Payment Status
            const statusY = cardsY + cardHeight + 25;
            
            // Order Status
            doc.fillColor('#dcfce7')
               .rect(35, statusY, 250, 45)
               .fill();
            
            doc.fillColor('#000000')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('ORDER STATUS', 45, statusY + 8);
            
            doc.fillColor('#166534')
               .fontSize(12)
               .text(order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1), 45, statusY + 25);

            if (order.deliveredAt) {
                doc.fillColor('#666666')
                   .fontSize(7)
                   .text(`Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}`, 45, statusY + 40);
            }

            // Payment Status
            doc.fillColor('#dbeafe')
               .rect(305, statusY, 250, 45)
               .fill();
            
            doc.fillColor('#000000')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('PAYMENT STATUS', 315, statusY + 8);
            
            doc.fillColor('#1e40af')
               .fontSize(12)
               .text(order.paymentStatus?.charAt(0)?.toUpperCase() + order.paymentStatus?.slice(1), 315, statusY + 25);
            
            doc.fillColor('#666666')
               .fontSize(7)
               .text(`Paid via ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 315, statusY + 40);

            // Items Table Header
            let yPosition = statusY + 70;
            
            // Check if we need a new page
            if (yPosition > 600) {
                doc.addPage();
                yPosition = 50;
            }

            // Table Header
            doc.fillColor('#f8fafc')
               .rect(35, yPosition, doc.page.width - 70, 20)
               .fill();
            
            doc.fillColor('#06b6d4')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('PRODUCT', 45, yPosition + 6)
               .text('PRICE', 350, yPosition + 6)
               .text('QTY', 420, yPosition + 6)
               .text('TOTAL', 480, yPosition + 6);

            yPosition += 25;

            // Items
            order.items.forEach((item, index) => {
                const productName = item.productId?.name || 'Product';
                const quantity = item.quantity;
                const price = item.price;
                const itemTotal = price * quantity;

                // Check if we need a new page
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                    
                    // Add table header on new page
                    doc.fillColor('#f8fafc')
                       .rect(35, yPosition, doc.page.width - 70, 20)
                       .fill();
                    
                    doc.fillColor('#06b6d4')
                       .fontSize(9)
                       .font('Helvetica-Bold')
                       .text('PRODUCT', 45, yPosition + 6)
                       .text('PRICE', 350, yPosition + 6)
                       .text('QTY', 420, yPosition + 6)
                       .text('TOTAL', 480, yPosition + 6);
                    
                    yPosition += 25;
                }

                // Alternate row background
                if (index % 2 === 0) {
                    doc.fillColor('#fafafa')
                       .rect(35, yPosition - 5, doc.page.width - 70, 25)
                       .fill();
                }

                doc.fillColor('#000000')
                   .font('Helvetica')
                   .fontSize(8)
                   .text(productName.substring(0, 40), 45, yPosition, { width: 280 })
                   .text(`₹${price.toLocaleString('en-IN')}`, 350, yPosition)
                   .text(quantity.toString(), 420, yPosition)
                   .text(`₹${itemTotal.toLocaleString('en-IN')}`, 480, yPosition);

                // Add size if available
                if (item.size) {
                    doc.fillColor('#666666')
                       .fontSize(7)
                       .text(`Size: ${item.size}`, 45, yPosition + 12);
                    yPosition += 8;
                }

                yPosition += 20;
                
                // Add separator line
                if (index < order.items.length - 1) {
                    doc.moveTo(35, yPosition - 2).lineTo(doc.page.width - 35, yPosition - 2).strokeColor('#e5e7eb').stroke();
                    yPosition += 5;
                }
            });

            // Check if we need a new page for totals
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
            }

            // Totals
            yPosition += 20;
            
            doc.fillColor('#f0f9ff')
               .rect(35, yPosition, doc.page.width - 70, 100)
               .fill();
            
            doc.fillColor('#000000')
               .fontSize(9)
               .text('Subtotal:', 400, yPosition + 15, { align: 'right' })
               .text(`₹${subtotal.toLocaleString('en-IN')}`, 500, yPosition + 15, { align: 'right' });
            
            doc.text('Shipping Fee:', 400, yPosition + 30, { align: 'right' })
               .text(`₹${shipping.toLocaleString('en-IN')}`, 500, yPosition + 30, { align: 'right' });
            
            doc.text('Tax (18% GST):', 400, yPosition + 45, { align: 'right' })
               .text(`₹${tax.toFixed(2)}`, 500, yPosition + 45, { align: 'right' });
            
            doc.strokeColor('#06b6d4')
               .moveTo(400, yPosition + 60).lineTo(550, yPosition + 60).stroke();
            
            doc.font('Helvetica-Bold')
               .fontSize(11)
               .text('Total Amount:', 400, yPosition + 75, { align: 'right' })
               .text(`₹${total.toLocaleString('en-IN')}`, 500, yPosition + 75, { align: 'right' });

            // Thank You Message
            yPosition += 120;
            doc.fillColor('#06b6d4')
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('Thank You for Your Order!', 35, yPosition, { align: 'center' });
            
            yPosition += 15;
            doc.fillColor('#666666')
               .fontSize(8)
               .font('Helvetica')
               .text('We appreciate your business and trust in Mishra Mart. For any queries, contact support@mishramart.com', 
                    35, yPosition, { 
                        align: 'center',
                        width: doc.page.width - 70 
                    });

            // Footer
            yPosition += 30;
            doc.fillColor('#9ca3af')
               .fontSize(7)
               .text('MISHRA MART • 123 Business Avenue, Tech Park, Mumbai, Maharashtra - 400001', 
                    35, yPosition, { align: 'center' })
               .text('GSTIN: 27AABCU9603R1ZM • support@mishramart.com • +91 98765 43210', 
                    35, yPosition + 10, { align: 'center' });

            doc.end();

        } catch (error) {
            console.error('PDF Generation Error:', error);
            reject(error);
        }
    });
};