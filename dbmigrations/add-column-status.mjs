// update-existing-records.mjs
// Script to add status field to existing DynamoDB records

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PistaGreenOrders';

async function updateExistingRecords() {
    try {
        console.log(`Starting update for table: ${TABLE_NAME}`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        let lastEvaluatedKey = undefined;
        
        do {
            // Scan the table
            const scanParams = {
                TableName: TABLE_NAME,
                ExclusiveStartKey: lastEvaluatedKey
            };
            
            const scanResult = await dynamodb.send(new ScanCommand(scanParams));
            
            console.log(`Retrieved ${scanResult.Items.length} items`);
            
            // Update each item that doesn't have a status field
            for (const item of scanResult.Items) {
                if (!item.status) {
                    try {
                        const updateParams = {
                            TableName: TABLE_NAME,
                            Key: {
                                name: item.name
                            },
                            UpdateExpression: 'SET #status = :status',
                            ExpressionAttributeNames: {
                                '#status': 'status'
                            },
                            ExpressionAttributeValues: {
                                ':status': 'Created'
                            }
                        };
                        
                        await dynamodb.send(new UpdateCommand(updateParams));
                        updatedCount++;
                        console.log(`Updated record: ${item.name}`);
                    } catch (updateError) {
                        console.error(`Error updating ${item.name}:`, updateError.message);
                    }
                } else {
                    skippedCount++;
                    console.log(`Skipped record ${item.name} (already has status: ${item.status})`);
                }
            }
            
            lastEvaluatedKey = scanResult.LastEvaluatedKey;
            
        } while (lastEvaluatedKey);
        
        console.log('\n=== Update Complete ===');
        console.log(`Records updated: ${updatedCount}`);
        console.log(`Records skipped: ${skippedCount}`);
        console.log(`Total processed: ${updatedCount + skippedCount}`);
        
    } catch (error) {
        console.error('Error updating records:', error);
        process.exit(1);
    }
}

updateExistingRecords();
