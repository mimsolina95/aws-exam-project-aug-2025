import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
//import {EventBridgeEvent} from "aws-lambda";
import {DynamoDBClient, UpdateItemCommand} from "@aws-sdk/client-dynamodb";
import {AnyItem} from './types';
import * as uuid from "uuid";

const snsClient = new SNSClient({});
const dynamoDbClient = new DynamoDBClient({});

export const handler = async (event: AnyItem) => {
    console.log(JSON.stringify(event));
    const {prop1, prop2} = event;

    const topicArn = process.env.TOPIC_ARN!;
    const tableName = process.env.TABLE_NAME!;
    const itemUuid = uuid.v4;

    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: 'secondJob',
        Message: `here we update an item with the following props ${prop1} and ${prop2}`
    }));

    //Find particular item and update its prop with a given value
    await dynamoDbClient.send(new UpdateItemCommand({
            TableName: tableName,
            Key: {
                PK: {
                    S: `ITEM#${itemUuid}`
                },
                SK: {
                    S: `METADATA#${itemUuid}`
                }
            },
            UpdateExpression: 'SET #s = :played', //set status to get its value from the variable :played and then set :played to the played from
            ExpressionAttributeNames: {'#s': 'status'},
            ExpressionAttributeValues: {
                ':played': {
                    S: 'played'
                }
            }
        }
    ));

    return {
        statusCode: 200,
        body: JSON.stringify({})
    }
}