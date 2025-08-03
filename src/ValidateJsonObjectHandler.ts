import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CreateScheduleCommand, SchedulerClient} from "@aws-sdk/client-scheduler";
import * as uuid from "uuid";
import {JsonObject} from './types';
import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});
const db = new DynamoDBClient();
const schedulerClient = new SchedulerClient();

export const handler = async (event: JsonObject) => {
    console.log(JSON.stringify(event));

    const {itemId, timestamp, content} = event;
    let resultBody = "";

    if (content.valid) {
        const topicArn = process.env.VALID_JSON_OBJECT_TOPIC_ARN!;
        resultBody = `Successfully validated and inserted new valid json with a timestamp of ${event.timestamp}. \n` + JSON.stringify(content);

        await snsClient.send(new PublishCommand({
            TopicArn: topicArn,
            Subject: 'ValidJsonObjectJob',
            Message: resultBody
        }));
    } else {
        const tableName = process.env.TABLE_NAME!;
        const itemId = uuid.v4;

        await db.send(new PutItemCommand({
            TableName: tableName,
            Item: {
                ITEM: {
                    S: `ITEM#${itemId}`
                },
                timestamp: {
                    N: JSON.stringify(timestamp)
                },
                content: {
                    S: JSON.stringify(content)
                }
            }
        }));

        const calculatedDeleteTime = new Date(event.timestamp).getDate() + 1; //TODO Check if is correct calculation
        const isoDeletionDateTime = new Date(calculatedDeleteTime).toISOString();
        const result = await schedulerClient.send(new CreateScheduleCommand({
            Name: `delete-jsonobject-at-${isoDeletionDateTime}`,
            ScheduleExpression: `at(${isoDeletionDateTime})`,
            Target: {
                Arn: '',
                Input: JSON.stringify({timestamp, content}),
                RoleArn: ''
            },
            FlexibleTimeWindow: {
                Mode: 'OFF'
            }
        }));

        resultBody = `Error occurred during validation of a json object with a timestamp of ${event.timestamp}.`;
        // omitting the logging of the content on purpose since it is logged above at the start of the handler
    }

    return {
        headers: {},
        body: resultBody,
        statusCode: 200
    }
}