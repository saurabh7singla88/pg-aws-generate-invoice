import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { randomUUID } from 'crypto';

// Initialize AWS clients
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const lambdaClient = new LambdaClient({});

const TABLE_NAME = process.env.TABLE_NAME || 'PistaGreenOrders';

export const handler = async (event) => {
    try {
        // Parse incoming webhook payload
        const payload = event.body ? JSON.parse(event.body) : event;
        
        const payloadString = JSON.stringify(payload);
        console.log(`Payload: ${payloadString}`);
        // Generate unique ID and timestamp
        const eventId = randomUUID();
        const timestamp = new Date().toISOString();
        
        // Prepare item for DynamoDB
        const item = {
            eventId,
            name: payload.name, // Extract name as partition key
            timestamp,
            status: 'Created',
            payload,
            headers: event.headers || {},
            sourceIp: event.requestContext?.identity?.sourceIp || 'unknown',
            httpMethod: event.httpMethod || 'POST',
            userAgent: event.headers?.['User-Agent'] || event.headers?.['user-agent'] || 'unknown',
            ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90 days expiration
        };
        
        // Store in DynamoDB
        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));
        
        console.log(`Webhook stored successfully: ${eventId}`);
        
        // Invoke invoice generation Lambda
        try {
            const invokeParams = {
                FunctionName: process.env.INVOICE_LAMBDA_NAME || 'invoice-generation-lambda',
                InvocationType: 'Event', // Asynchronous invocation
                Payload: JSON.stringify(payload)
            };
            
            await lambdaClient.send(new InvokeCommand(invokeParams));
            console.log('Invoice generation Lambda invoked successfully');
        } catch (invokeError) {
            console.error('Error invoking invoice Lambda:', invokeError);
            // Continue even if invoice generation fails
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Webhook event stored successfully',
                eventId,
                timestamp
            })
        };
        
    } catch (error) {
        console.error('Error storing webhook:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: 'Failed to store webhook event',
                error: error.message
            })
        };
    }
};

