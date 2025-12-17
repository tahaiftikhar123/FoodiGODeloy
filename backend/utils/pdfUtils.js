import PDFDocument from 'pdfkit';

const generateFoodiGOBillPDF = (order, customerName) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        const deliveryCharge = 20; 
        const totalAmount = order.amount;
        const subtotal = totalAmount - deliveryCharge;
        const orangeColor = '#FF6347'; 
        const greyColor = '#555555';
        let cursorY = 50;

        doc.fontSize(28)
           .fillColor(orangeColor)
           .font('Helvetica-Bold')
           .text('FoodiGO Invoice', 50, cursorY);
           
        cursorY += 40;

        doc.fontSize(10)
           .fillColor(greyColor)
           .font('Helvetica');
           
        doc.text(`Invoice ID: ${order._id.toString().slice(-8).toUpperCase()}`, 50, cursorY)
           .text('Date:', 400, cursorY, { width: 90, align: 'right' })
           .text(new Date().toLocaleDateString('en-IN'), 490, cursorY, { width: 90, align: 'right' });

        cursorY += 40;

      
        doc.fontSize(12)
           .fillColor('#000000')
           .font('Helvetica-Bold')
           .text('Bill To:', 50, cursorY);

        doc.font('Helvetica')
           .text(`Customer Name: ${customerName}`, 50, cursorY + 15)
           .text(`Email: ${order.address.email}`, 50, cursorY + 30)
           .text(`Phone: ${order.address.phone}`, 50, cursorY + 45);


        doc.font('Helvetica-Bold')
           .text('Ship To:', 350, cursorY); 
           
        const addressText = `${order.address.street}, ${order.address.city}\n${order.address.state}, ${order.address.zipcode}`;
        
        doc.font('Helvetica')
           .text(addressText, 350, cursorY + 15, { width: 200, continued: false });

        cursorY += 80;

        doc.strokeColor(orangeColor)
           .lineWidth(1)
           .moveTo(50, cursorY)
           .lineTo(550, cursorY)
           .stroke();
           
        cursorY += 15;
        
        const tableTop = cursorY;
        doc.fontSize(10)
           .fillColor(orangeColor)
           .font('Helvetica-Bold');
           
        doc.text('Item Name', 50, tableTop)
           .text('Quantity', 300, tableTop, { width: 90, align: 'right' })
           .text('Unit Price (₹)', 380, tableTop, { width: 90, align: 'right' })
           .text('Total (₹)', 480, tableTop, { width: 90, align: 'right' });

        cursorY += 15;

        doc.strokeColor(greyColor)
           .lineWidth(0.5)
           .moveTo(50, cursorY)
           .lineTo(550, cursorY)
           .stroke();
        
        cursorY += 10;
        
        doc.fontSize(10)
           .fillColor('#000000')
           .font('Helvetica');
           
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            if (cursorY + 30 > doc.page.height - 70) {
                doc.addPage();
                cursorY = 50;
            }
            
            doc.text(item.name, 50, cursorY)
               .text(item.quantity, 300, cursorY, { width: 90, align: 'right' })
               .text(item.price.toFixed(2), 380, cursorY, { width: 90, align: 'right' })
               .text(itemTotal.toFixed(2), 480, cursorY, { width: 90, align: 'right' });
            cursorY += 20;
        });

        cursorY += 20;

        doc.fontSize(10)
           .font('Helvetica');
           
        doc.text('Subtotal:', 400, cursorY, { width: 80, align: 'right' })
           .text(`₹${subtotal.toFixed(2)}`, 480, cursorY, { width: 90, align: 'right' });

        doc.text('Delivery Charge:', 400, cursorY + 15, { width: 80, align: 'right' })
           .text(`₹${deliveryCharge.toFixed(2)}`, 480, cursorY + 15, { width: 90, align: 'right' });

        doc.moveTo(400, cursorY + 35)
           .lineTo(550, cursorY + 35)
           .strokeColor(orangeColor)
           .lineWidth(1);

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(orangeColor)
           .text('TOTAL PAID:', 400, cursorY + 45, { width: 80, align: 'right' })
           .text(`₹${totalAmount.toFixed(2)}`, 480, cursorY + 45, { width: 90, align: 'right' });

        doc.fontSize(10)
           .fillColor(greyColor)
           .text('Thank you for choosing FoodiGO! Your order is being processed.', 
                 50, 
                 doc.page.height - 50, 
                 { align: 'center', width: 500 });

        doc.end();
    });
};

export { generateFoodiGOBillPDF };