// lambda-shopify-orderUpdated.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Initialize AWS clients
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME || 'PistaGreenOrders';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Moves invoice file(s) from invoices/ folder to cancelled-invoices/ folder in S3
 * @param {string} orderName - Order name to search for
 * @returns {Promise<Array>} Array of moved file keys
 */
async function moveInvoiceToCancelledFolder(orderName) {
    const movedFiles = [];
    const orderNameClean = orderName.replace('#', '');
    
    try {
        // List all objects with the order name in the invoices folder
        const listParams = {
            Bucket: S3_BUCKET_NAME,
            Prefix: 'invoices/',
        };
        
        const listResult = await s3Client.send(new ListObjectsV2Command(listParams));
        
        if (!listResult.Contents || listResult.Contents.length === 0) {
            console.log(`No invoices found for order: ${orderName}`);
            return movedFiles;
        }
        
        // Filter files that match the order name
        const matchingFiles = listResult.Contents.filter(item => 
            item.Key.includes(`invoice-${orderNameClean}`)
        );
        
        if (matchingFiles.length === 0) {
            console.log(`No matching invoice files found for order: ${orderName}`);
            return movedFiles;
        }
        
        // Move each matching file to the cancelled-invoices folder
        for (const file of matchingFiles) {
            const sourceKey = file.Key;
            const fileName = sourceKey.split('/').pop();
            const destinationKey = `cancelled-invoices/${fileName}`;
            
            // Copy to cancelled-invoices folder
            await s3Client.send(new CopyObjectCommand({
                Bucket: S3_BUCKET_NAME,
                CopySource: `${S3_BUCKET_NAME}/${sourceKey}`,
                Key: destinationKey
            }));
            
            console.log(`Copied ${sourceKey} to ${destinationKey}`);
            
            // Delete from original location
            await s3Client.send(new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: sourceKey
            }));
            
            console.log(`Deleted ${sourceKey}`);
            movedFiles.push(destinationKey);
        }
        
        return movedFiles;
        
    } catch (error) {
        console.error('Error moving invoice to cancelled-invoices folder:', error);
        throw error;
    }
}

/**
 * AWS Lambda handler that processes order update webhooks.
 * Checks if payment status is refunded and updates DynamoDB status to Returned.
 * @param {object} event - The event payload sent to the Lambda function.
 * @returns {object} - Response indicating success or failure.
 */
export async function handler(event) {
    try {
        // Parse incoming payload
        const payload = event.body ? JSON.parse(event.body) : event;
        
        console.log('Received order update payload:', JSON.stringify(payload, null, 2));
        
        // Extract order name from payload
        const orderName = payload.name;
        
        if (!orderName) {
            throw new Error('Order name not found in payload');
        }
        
        // Check payment status
        const paymentStatus = payload.financial_status || payload.paymentStatus;
        
        console.log(`Order: ${orderName}, Payment Status: ${paymentStatus}`);
        
        // Only proceed if payment status is refunded
        if (paymentStatus !== 'refunded') {
            console.log(`Payment status is not refunded (${paymentStatus}), skipping status update`);
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Payment status is not refunded, no action taken',
                    orderName,
                    paymentStatus
                })
            };
        }
        
        // Fetch the DynamoDB record
        const getParams = {
            TableName: TABLE_NAME,
            Key: {
                name: orderName
            }
        };
        
        const getResult = await dynamodb.send(new GetCommand(getParams));
        
        if (!getResult.Item) {
            console.log(`No record found for order: ${orderName}`);
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    message: 'Order record not found',
                    orderName 
                })
            };
        }
        
        console.log('Existing record:', JSON.stringify(getResult.Item, null, 2));
        
        // Update status to Returned
        const updateParams = {
            TableName: TABLE_NAME,
            Key: {
                name: orderName
            },
            UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'Returned',
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };
        
        const updateResult = await dynamodb.send(new UpdateCommand(updateParams));
        
        console.log('Updated record:', JSON.stringify(updateResult.Attributes, null, 2));
        
        // Move invoice to cancelled-invoices folder in S3
        let movedFiles = [];
        try {
            movedFiles = await moveInvoiceToCancelledFolder(orderName);
            if (movedFiles.length > 0) {
                console.log(`Moved ${movedFiles.length} invoice file(s) to cancelled-invoices folder`);
            }
        } catch (s3Error) {
            console.error('Error moving invoice to cancelled-invoices folder:', s3Error);
            // Continue even if S3 operation fails
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Order status updated to Returned successfully',
                orderName,
                paymentStatus,
                updatedRecord: updateResult.Attributes,
                movedInvoices: movedFiles
            })
        };
        
    } catch (error) {
        console.error('Error processing order update:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to process order update',
                error: error.message
            })
        };
    }
}
