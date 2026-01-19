import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates a PDF invoice from invoice data
 * @param {Object} data - Invoice data containing order, customer, line items, and totals
 * @returns {Promise<Buffer>} PDF buffer
 */
export function generateInvoicePDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        // Register a font that supports ₹ symbol (Helvetica is the default and supports it)
        // If the symbol still doesn't show, we may need to embed a custom font
        
        const chunks = [];
        
        // Collect PDF data
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        
        // --- HEADER SECTION ---
        // Company Logo & Name (Left)
        doc.fontSize(28)
           .fillColor('#111827')
           .text('PistaGreen', 50, 50);
        
        doc.fontSize(11)
           .fillColor('#6b7280')
           .text('Maurya Enterprises', 50, 83)
           .text('SCO 10, First Floor, Modern Complex, Zirakpur, SAS', 50, 98)
           .text('Nagar, Punjab 140603', 50, 113)
           .text('03AUBPR7748B1ZR', 50, 128);
        
        // Logo Image (Top Right, above INVOICE)
        try {
            const logoPath = join(__dirname, '..', 'assets', 'PistagreenLogo.JPG');
            doc.image(logoPath, 455, 55, { width: 90 });
        } catch (error) {
            console.error('Logo file not found, skipping logo:', error.message);
        }
        
        // Invoice Title (Right)
        // doc.fontSize(20)
        //    .fillColor('#111827')
        //    .text('INVOICE', 300, 140, { width: 245, align: 'right' });
        
        // doc.fontSize(12)
        //    .fillColor('#6b7280')
        //    .text(data.order.name, 300, 123, { width: 245, align: 'right' })
        //    .text(data.order.date, 300, 143, { width: 245, align: 'right' });
        
        // Horizontal line
        doc.moveTo(50, 175)
           .lineTo(545, 175)
           .strokeColor('#e5e7eb')
           .stroke();
        
        // --- TWO COLUMN LAYOUT: ORDER DETAILS AND SHIPPING ADDRESS ---
        let yPos = 195;
        
        // Left Column - Order Details
        doc.fontSize(16)
           .fillColor('#111827')
           .text('Order Details', 50, yPos);
        
        // Right Column - Shipping Address
        doc.fontSize(16)
           .fillColor('#111827')
           .text('Shipping Address', 300, yPos, { width: 245, align: 'right' });
        
        yPos += 30;
        
        // Left Column - Order Number and Date
        doc.fontSize(11)
           .fillColor('#6b7280')
           .text('Order Number:', 50, yPos);
        doc.fillColor('#111827')
           .text(data.order.name, 130, yPos);
        
        // Right Column - Customer Name
        doc.fontSize(11)
           .fillColor('#111827')
           .text(data.customer.name, 300, yPos, { width: 245, align: 'right' });
        
        yPos += 22;
        
        // Left Column - Order Date
        doc.fillColor('#6b7280')
           .text('Order Date:', 50, yPos);
        doc.fillColor('#111827')
           .text(data.order.date, 120, yPos);
        
        // Right Column - Shipping Address (dynamic height)
        const addressText = data.shippingAddress.address || '';
        const cityStateZip = [data.shippingAddress.city, data.shippingAddress.state, data.shippingAddress.zip].filter(Boolean).join(', ');
        
        // Calculate height needed for address
        let addressYPos = yPos;
        doc.fontSize(11)
           .fillColor('#111827');
        
        if (addressText) {
            doc.text(addressText, 300, addressYPos, { width: 245, align: 'right' });
            addressYPos += doc.heightOfString(addressText, { width: 245 }) + 4;
        }
        
        if (cityStateZip) {
            doc.text(cityStateZip, 300, addressYPos, { width: 245, align: 'right' });
            addressYPos += doc.heightOfString(cityStateZip, { width: 245 }) + 4;
        }
        
        // Update yPos to the maximum of left column or right column height
        yPos = Math.max(yPos + 22, addressYPos);
        
        // --- ITEMS TABLE ---
        yPos += 10;
        
        doc.fontSize(16)
           .fillColor('#111827')
           .text('Items', 50, yPos);
        
        yPos += 30;
        
      const showCartDiscount = Boolean(data.hasCartDiscount);
      const columnLayout = showCartDiscount
         ? {
            item: { x: 55, width: 95 },
            qty: { x: 150, width: 25 },
            mrp: { x: 175, width: 55 },
            discount: { x: 230, width: 50 },
            cartDiscount: { x: 280, width: 55 },
            sellingPrice: { x: 335, width: 60 },
            tax: { x: 395, width: 65 },
            sellingPriceAfterTax: { x: 435, width: 90 }
         }
         : {
            item: { x: 55, width: 110 },
            qty: { x: 165, width: 25 },
            mrp: { x: 190, width: 55 },
            discount: { x: 245, width: 55 },
            sellingPrice: { x: 300, width: 70 },
            tax: { x: 360, width: 60 },
            sellingPriceAfterTax: { x: 405, width: 120 }
         };

      // Table header with border
        doc.rect(50, yPos, 495, 35)
           .fillAndStroke('#4a4a4a', '#4a4a4a');
        
      // Table headers: Item, Qty, MRP, Item Discount, Cart Discount (optional), Selling price before tax, Tax, Selling price after tax
        doc.fontSize(8)
           .fillColor('#ffffff')
         .text('Item', columnLayout.item.x, yPos + 12, { width: columnLayout.item.width })
         .text('Qty', columnLayout.qty.x, yPos + 12, { width: columnLayout.qty.width, align: 'center' })
         .text('MRP', columnLayout.mrp.x, yPos + 12, { width: columnLayout.mrp.width, align: 'right' })
         .text('Item\ndiscount', columnLayout.discount.x, yPos + 8, { width: columnLayout.discount.width, align: 'right' })
         .text('Selling price\nbefore tax', columnLayout.sellingPrice.x, yPos + 8, { width: columnLayout.sellingPrice.width, align: 'right' })
         .text('Tax', columnLayout.tax.x, yPos + 12, { width: columnLayout.tax.width, align: 'right' })
         .text('Selling price\nafter tax', columnLayout.sellingPriceAfterTax.x, yPos + 8, { width: columnLayout.sellingPriceAfterTax.width, align: 'right' });

      if (showCartDiscount) {
         doc.text('Cart\ndiscount', columnLayout.cartDiscount.x, yPos + 8, { width: columnLayout.cartDiscount.width, align: 'right' });
      }
        
        yPos += 35;
        
        // Table rows with borders
        data.lineItems.forEach((item, index) => {
            // Concatenate item name with description (variant)
            const itemDisplayName = item.description 
                ? `${item.name} (${item.description.replace('Variant: ', '')})`
                : item.name;
            
            // Calculate height needed for the item name text
            const textHeight = doc.heightOfString(itemDisplayName, { width: columnLayout.item.width });
            const rowHeight = Math.max(35, textHeight + 20); // Minimum 35px, or text height + padding
            
            // Row border
            doc.rect(50, yPos, 495, rowHeight)
               .strokeColor('#e5e7eb')
               .stroke();
            
            doc.fontSize(8)
               .fillColor('#111827')
               .text(itemDisplayName, columnLayout.item.x, yPos + 10, { width: columnLayout.item.width });
            
            doc.fontSize(8)
               .fillColor('#111827')
               .text(item.quantity.toString(), columnLayout.qty.x, yPos + 10, { width: columnLayout.qty.width, align: 'center' })
               .text(item.mrp, columnLayout.mrp.x, yPos + 10, { width: columnLayout.mrp.width, align: 'right' })
               .text(item.discount, columnLayout.discount.x, yPos + 10, { width: columnLayout.discount.width, align: 'right' })
               .text(item.sellingPrice, columnLayout.sellingPrice.x, yPos + 10, { width: columnLayout.sellingPrice.width, align: 'right' })
               .text(item.tax, columnLayout.tax.x, yPos + 10, { width: columnLayout.tax.width, align: 'right' })
               .text(item.sellingPriceAfterTax, columnLayout.sellingPriceAfterTax.x, yPos + 10, { width: columnLayout.sellingPriceAfterTax.width, align: 'right' });

            if (showCartDiscount) {
                doc.text(item.cartDiscount || 'Rs. 0.00', columnLayout.cartDiscount.x, yPos + 10, { width: columnLayout.cartDiscount.width, align: 'right' });
            }
            
            yPos += rowHeight;
        });
        
        // Line above totals
        yPos += 10;
        doc.moveTo(350, yPos)
           .lineTo(545, yPos)
           .strokeColor('#e5e7eb')
           .stroke();
        
        // --- TOTALS SECTION ---
        yPos += 25;
        
        // Subtotal
        doc.fontSize(11)
           .fillColor('#6b7280')
           .text('Subtotal ', 380, yPos, { continued: true })
           .fontSize(9)
           .text('(before tax)', { continued: false });
        doc.fontSize(11)
           .fillColor('#111827')
           .text(data.totals.subtotal, 450, yPos, { width: 85, align: 'right' });
        
        // Tax
        yPos += 22;
        doc.fillColor('#6b7280')
           .text('Total Tax:', 380, yPos);
        doc.fillColor('#111827')
           .text(data.totals.tax, 450, yPos, { width: 85, align: 'right' });

        // Discount (if exists)
        if (data.totals.discount) {
            yPos += 22;
            doc.fillColor('#6b7280')
               .text('Discount:', 380, yPos);
            doc.fillColor('#dc2626')
               .text(data.totals.discount, 450, yPos, { width: 85, align: 'right' });
        }
        
        // Shipping (always show)
        yPos += 22;
        doc.fillColor('#6b7280')
           .text('Shipping:', 380, yPos);
        doc.fillColor('#111827')
           .text(data.totals.shipping, 450, yPos, { width: 85, align: 'right' });
        
        
        
        // Total (highlighted)
        yPos += 28;
        doc.rect(365, yPos - 10, 180, 35)
           .fillColor('#4a4a4a')
           .fill();
        
        doc.fontSize(13)
           .fillColor('#ffffff')
           .text('TOTAL:', 380, yPos);
        doc.fontSize(15)
           .text(data.totals.total, 450, yPos, { width: 85, align: 'right' });
        
        // --- NOTES SECTION ---
        yPos += 60;
        if (data.order.notes) {
            doc.fontSize(12)
               .fillColor('#6b7280')
               .text('NOTES', 50, yPos);
            
            yPos += 20;
            doc.fontSize(10)
               .fillColor('#111827')
               .text(data.order.notes, 50, yPos, { width: 495 });
            
            yPos += 15;
            doc.fontSize(10)
               .fillColor('#111827')
               .text('\nIf you have any questions, please contact at support@pistagreen.com', 50, yPos, { width: 495 });

             yPos += 25;
            doc.fontSize(10)
               .fillColor('#111827')
               .text('\nAll disputes are subject to Punjab jurisdiction only. Goods once sold will only be taken back or exchanged as per the store\'s exchange/return policy', 50, yPos, { width: 495 });
        }
        
        
        doc.end();
    });
}
