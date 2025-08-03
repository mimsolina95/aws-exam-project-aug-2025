import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
//import {EventBridgeEvent} from "aws-lambda";
import {DeleteItemCommand, DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {JsonObject} from './types';
import * as uuid from "uuid";

const snsClient = new SNSClient({});
const dynamoDbClient = new DynamoDBClient({});

export const handler = async (event: JsonObject) => {
    console.log(JSON.stringify(event));

    const {itemId, timestamp, content} = event;

    const topicArn = process.env.DELETED_JSON_OBJECT_TOPIC_ARN!;
    const tableName = process.env.TABLE_NAME!;

    await dynamoDbClient.send(new DeleteItemCommand({
        TableName: tableName,
        Key: {
            id: {S: `ITEM#${itemId}`}
        }
    }));

    //this calculation of timeSpent in DB could have been another schedule to run within 30min, but no time, sry ;(
    const timeSpent = Date.now() - timestamp;
    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: 'DeleteExpiredJsonJob',
        Message: `Expired json object with timestamp ${timestamp} was just deleted successfully. Time spent in DB: ${timeSpent}`
    }));

    return {
        statusCode: 200,
        body: JSON.stringify({})
    }
}