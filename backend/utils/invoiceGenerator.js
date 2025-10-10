import PDFDocument from 'pdfkit';
import axios from 'axios';
import path from 'path';

const getImageBase64 = async (imageUrl) => {
   try {
      if (imageUrl.includes('unsplash.com') ||
         imageUrl.includes('via.placeholder.com') ||
         imageUrl.startsWith('data:')) {
         return null;
      }

      const response = await axios.get(imageUrl, {
         responseType: 'arraybuffer',
         timeout: 10000
      });

      const base64 = Buffer.from(response.data).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
   } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
   }
};

export const generateInvoice = async (order) => {
   return new Promise(async (resolve, reject) => {
      try {
         // Absolute path to logo.png in your public folder
         const logoPath = path.resolve(process.cwd(), 'public', 'logo.png');

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

         doc.font('Helvetica');

         const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
         const tax = subtotal * 0.18;
         const shipping = 50;
         const total = order.totalAmount || (subtotal + tax + shipping);

         // HEADER with logo
         doc.fillColor('#06b6d4')
            .rect(0, 0, doc.page.width, 70)
            .fill();

         // Center the logo vertically
         const logoHeight = 130;
         const logoY = (70 - logoHeight) / 2;

         doc.image(logoPath, 40, logoY, { width: 110, height: logoHeight });

         // Invoice text on right side
         doc.fillColor('#ffffff')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('INVOICE', doc.page.width - 130, 25, { align: 'right' });

         doc.fontSize(8)
            .text(`#${order.orderId}`, doc.page.width - 130, 45, { align: 'right' })
            .text(new Date(order.createdAt).toLocaleDateString('en-IN'), doc.page.width - 130, 55, { align: 'right' });


         // COMPANY & CUSTOMER DETAILS
         const detailsY = 90;

         doc.fillColor('#000000')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('FROM:', 40, detailsY);

         doc.font('Helvetica')
            .fontSize(8)
            .text('MISHRA MART', 40, detailsY + 15)
            .text('123 Business Avenue, Tech Park', 40, detailsY + 25)
            .text('Mumbai, Maharashtra - 400001', 40, detailsY + 35)
            .text('GSTIN: 27AABCU9603R1ZM', 40, detailsY + 45);

         doc.font('Helvetica-Bold')
            .text('BILL TO:', 320, detailsY);

         const customer = order.shippingAddress;
         doc.font('Helvetica')
            .text(customer.name, 320, detailsY + 15)
            .text(customer.address, 320, detailsY + 25, { width: 200 })
            .text(`${customer.city}, ${customer.state} - ${customer.pincode}`, 320, detailsY + 35, { width: 200 })
            .text(`Phone: ${customer.phone}`, 320, detailsY + 45);

         // COMPACT CARDS
         const cardsY = detailsY + 65;

         const drawCompactCard = (x, y, title, content) => {
            doc.fillColor('#f0f9ff')
               .rect(x, y, 120, 26)
               .fill();

            doc.fillColor('#0369a1')
               .fontSize(6)
               .font('Helvetica-Bold')
               .text(title, x + 6, y + 5);

            doc.fillColor('#000000')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text(content, x + 6, y + 14, { width: 110 });
         };

         drawCompactCard(40, cardsY, 'INVOICE NUMBER', order.orderId);
         drawCompactCard(170, cardsY, 'INVOICE DATE', new Date(order.createdAt).toLocaleDateString('en-IN'));
         drawCompactCard(300, cardsY, 'ORDER DATE', new Date(order.createdAt).toLocaleDateString('en-IN'));
         drawCompactCard(430, cardsY, 'PAYMENT METHOD', order.paymentMethod === 'cod' ? 'COD' : 'Online');

         // STATUS BADGES
         const statusY = cardsY + 35;

         doc.fillColor(order.status === 'delivered' ? '#dcfce7' : '#fef3c7')
            .rect(40, statusY, 130, 20)
            .fill();

         doc.fillColor('#000000')
            .fontSize(6)
            .font('Helvetica-Bold')
            .text('ORDER STATUS', 45, statusY + 4);

         doc.fillColor(order.status === 'delivered' ? '#166534' : '#92400e')
            .fontSize(7)
            .text(order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1), 45, statusY + 11);

         doc.fillColor('#dbeafe')
            .rect(190, statusY, 130, 20)
            .fill();

         doc.fillColor('#000000')
            .fontSize(6)
            .font('Helvetica-Bold')
            .text('PAYMENT STATUS', 195, statusY + 4);

         doc.fillColor('#1e40af')
            .fontSize(7)
            .text('Paid', 195, statusY + 11);

         // ITEMS TABLE HEADER
         const tableY = statusY + 35;

         doc.fillColor('#f8fafc')
            .rect(40, tableY, doc.page.width - 80, 14)
            .fill();

         doc.fillColor('#475569')
            .fontSize(7)
            .font('Helvetica-Bold')
            .text('PRODUCT', 45, tableY + 4)
            .text('PRICE', 330, tableY + 4, { width: 50, align: 'right' })
            .text('QTY', 390, tableY + 4, { width: 30, align: 'right' })
            .text('TOTAL', doc.page.width - 85, tableY + 4, { align: 'right' });

         let currentY = tableY + 18;
         let itemCount = 0;

         for (const item of order.items || []) {
            if (currentY > 640) break;

            const rowHeight = 34;

            if (itemCount % 2 === 0) {
               doc.fillColor('#fafafa')
                  .rect(40, currentY, doc.page.width - 80, rowHeight)
                  .fill();
            }

            const productImages = item.productId?.images || [];
            const imageUrl = item.image ||
               productImages[0] ||
               item.productId?.image1 ||
               item.productId?.image2 ||
               item.productId?.image3 ||
               item.productId?.image4;

            if (imageUrl && !imageUrl.includes('unsplash.com') && !imageUrl.includes('via.placeholder.com')) {
               try {
                  const imageBase64 = await getImageBase64(imageUrl);
                  if (imageBase64) {
                     doc.image(imageBase64, 45, currentY + 5, {
                        width: 26,
                        height: 26
                     });
                  }
               } catch {
                  doc.fillColor('#e5e7eb')
                     .rect(45, currentY + 5, 26, 26)
                     .fill();
               }
            } else {
               doc.fillColor('#e5e7eb')
                  .rect(45, currentY + 5, 26, 26)
                  .fill();
            }

            const textStartX = 78;

            doc.fillColor('#000000')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text(item.productId?.name || 'Product', textStartX, currentY + 6, {
                  width: 200,
                  ellipsis: true
               });

            if (item.size) {
               doc.fontSize(6)
                  .fillColor('#666666')
                  .text(`Size: ${item.size}`, textStartX, currentY + 18);
            }

            doc.fillColor('#000000')
               .fontSize(7)
               .text(`Rs. ${item.price.toLocaleString('en-IN')}`, 330, currentY + 10, { width: 50, align: 'right' })
               .text(item.quantity.toString(), 390, currentY + 10, { width: 30, align: 'right' })
               .text(`Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`, doc.page.width - 85, currentY + 10, { align: 'right' });

            currentY += rowHeight;
            itemCount++;

            if (itemCount < order.items.length) {
               doc.moveTo(40, currentY)
                  .lineTo(doc.page.width - 40, currentY)
                  .strokeColor('#f1f5f9')
                  .lineWidth(0.5)
                  .stroke();
               currentY += 3;
            }
         }

         // TOTALS SECTION
         const totalsY = Math.min(currentY + 15, 690);

         doc.fillColor('#f0f9ff')
            .rect(doc.page.width - 270, totalsY, 240, 100)
            .fill();

         doc.fillColor('#000000')
            .fontSize(8)
            .text('Subtotal:', doc.page.width - 260, totalsY + 10)
            .text('Shipping Fee:', doc.page.width - 260, totalsY + 22)
            .text('Tax (18% GST):', doc.page.width - 260, totalsY + 34)
            .font('Helvetica-Bold')
            .text('Total Amount:', doc.page.width - 260, totalsY + 80);

         doc.font('Helvetica')
            .text(`Rs. ${subtotal.toLocaleString('en-IN')}`, doc.page.width - 260, totalsY + 10, { align: 'right' })
            .text(`Rs. ${shipping.toLocaleString('en-IN')}`, doc.page.width - 260, totalsY + 22, { align: 'right' })
            .text(`Rs. ${tax.toFixed(2)}`, doc.page.width - 260, totalsY + 34, { align: 'right' })
            .font('Helvetica-Bold')
            .text(`Rs. ${total.toLocaleString('en-IN')}`, doc.page.width - 260, totalsY + 80, { align: 'right' });
         // shifted left by 20px


         // THANK YOU SECTION
         const thankYouY = totalsY + 150;

         if (thankYouY < 770) {
            doc.fillColor('#06b6d4')
               .rect(40, thankYouY, doc.page.width - 80, 24)
               .fill();

            doc.fillColor('#ffffff')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('Thank You for Your Order!', 50, thankYouY + 8);
         }

         // FOOTER SECTION
         const footerY = doc.page.height - 40;

         doc.fontSize(7)
            .fillColor('#9ca3af')
            .text('Mishra Mart © 2025. All rights reserved.', 50, footerY, {
               align: 'center',
               width: doc.page.width - 100,
            });

         doc.end();

      } catch (error) {
         console.error('PDF Generation Error:', error);
         reject(error);
      }
   });
};
