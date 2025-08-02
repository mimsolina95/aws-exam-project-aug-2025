//import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {APIGatewayProxyResult} from "aws-lambda";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CreateScheduleCommand, SchedulerClient} from "@aws-sdk/client-scheduler";
import * as uuid from "uuid";
import {AnyItem} from './types';

const db = new DynamoDBClient();
const schedulerClient = new SchedulerClient();

export const handler: APIGatewayProxyResult = async (event: AnyItem) => {
    console.log(JSON.stringify(event));

    const {prop1, prop2} = event;
    const tableName = process.env.TABLE_NAME!;

    const entryUuid = uuid.v4;

    await db.send(new PutItemCommand({
        TableName: tableName,
        Item: {
            PK: {
                S: `PROP1#${entryUuid}`
            },
            SK: {
                S: `METADATA#${entryUuid()}`
            },
            prop1: {
                S: prop1
            },
            prop2: {
                S: prop2
            }
        }
    }))
    const calculatedPlayTime = new Date().toISOString(); //todo Do calculations

    const result = await schedulerClient.send(new CreateScheduleCommand({
        Name: `do-what${prop1}`,
        ScheduleExpression: `at(${calculatedPlayTime})`,
        Target: {
            Arn: '',
            Input: JSON.stringify({prop1, prop2}),
            RoleArn: ''
        },
        FlexibleTimeWindow: {
            Mode: 'OFF'
        }
    }));

    return {
        headers: {},
        body: JSON.stringify({}),
        statusCode: 200
    }
}