import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient } from '../config/awsClients.mjs';

/**
 * Builds a formatted email message for the invoice
 * @param {Object} invoiceData - Invoice data
 * @param {string} s3Url - URL to the PDF in S3
 * @returns {string} Formatted email message
 */
function buildEmailMessage(invoiceData, s3Url) {
    // Build line items table
    let lineItemsText = '';
    invoiceData.lineItems.forEach((item, index) => {
        lineItemsText += `\n  ${index + 1}. ${item.name}`;
        if (item.description) {
            lineItemsText += `\n     ${item.description}`;
        }
        lineItemsText += `\n     Qty: ${item.quantity}  |  Price: ${item.unitPrice}  |  Discount: ${item.discount || '₹0.00'}  |  Tax: ${item.tax || '₹0.00'}  |  Amount: ${item.lineTotal}`;
        lineItemsText += '\n';
    });
    
    return `
╔═══════════════════════════════════════════════════════════════════════╗
║                           🌿 PistaGreen                                ║
║                          Maurya Enterprises                            ║
║         SCO 10, First Floor, Modern Complex, Zirakpur, SAS            ║
║                  Nagar, Punjab 140603                                  ║
║                     GSTIN: 03AUBPR7748B1ZR                            ║
║                                                                        ║
║                             I N V O I C E                              ║
╚═══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER DETAILS                       SHIPPING ADDRESS
                                    
Order Number: ${invoiceData.order.name}              ${invoiceData.shippingAddress.name}
Order Date:   ${invoiceData.order.date}              ${invoiceData.shippingAddress.address}
${invoiceData.order.dueDate ? `Due Date:     ${invoiceData.order.dueDate}` : ''}              ${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state} ${invoiceData.shippingAddress.zip}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ITEMS ORDERED:
${lineItemsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT SUMMARY:

Subtotal:              ${invoiceData.totals.subtotal}
${invoiceData.totals.discount ? `Discount:              ${invoiceData.totals.discount}\n` : ''}${invoiceData.totals.shipping ? `Shipping:              ${invoiceData.totals.shipping}\n` : ''}Tax:                   ${invoiceData.totals.tax}

╔═══════════════════════════════════════════════════════════════════════╗
║  TOTAL:                ${invoiceData.totals.total.padEnd(48)}║
╚═══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 DOWNLOAD YOUR PDF INVOICE:
${s3Url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${invoiceData.order.notes ? `\nNOTES:\n${invoiceData.order.notes}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` : ''}
Thank you for your business!

For any queries, please contact us at:
Email: support@pistagreen.com
Phone: +91-XXXXXXXXXX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEGAL DISCLAIMER:
• All disputes are subject to Punjab jurisdiction only.
• Goods once sold will only be taken back or exchanged as per the store's 
  exchange/return policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated invoice notification from PistaGreen Invoice System.
    `.trim();
}

/**
 * Sends an email notification via SNS
 * @param {Object} invoiceData - Invoice data
 * @param {string} s3Url - URL to the PDF in S3
 * @returns {Promise<void>}
 */
export async function sendInvoiceNotification(invoiceData, s3Url) {
    try {
        const emailMessage = buildEmailMessage(invoiceData, s3Url);
        
        const snsParams = {
            TopicArn: process.env.SNS_TOPIC_ARN,
            Subject: `Invoice ${invoiceData.order.name} - ${invoiceData.totals.total}`,
            Message: emailMessage,
            MessageAttributes: {
                orderNumber: {
                    DataType: 'String',
                    StringValue: invoiceData.order.name
                },
                customerEmail: {
                    DataType: 'String',
                    StringValue: invoiceData.customer.email
                },
                invoiceUrl: {
                    DataType: 'String',
                    StringValue: s3Url
                }
            }
        };
        
        await snsClient.send(new PublishCommand(snsParams));
        console.log('Email notification sent via SNS');
    } catch (snsError) {
        console.error('Error sending SNS notification:', snsError);
        // Continue even if email fails - don't throw
    }
}
