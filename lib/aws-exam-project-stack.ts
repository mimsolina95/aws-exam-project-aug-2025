import {Stack, StackProps} from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import {Subscription, SubscriptionProtocol} from "aws-cdk-lib/aws-sns";
import {Construct} from "constructs";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class AwsExamProjectStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //////////////////////////////////////////////////////
        // CREATE TABLE
        const jsonObjectsTable = new Table(this, 'jsonobjects', {
            partitionKey: {
                name: 'ITEM',
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST
            //in this case it does not make sense to have a provisioned mode
            // since we do not have a statistics how are requests distributed across time, etc.
        });

        //////////////////////////////////////////////////////
        // CREATE VALID JSON TOPIC + LAMBDA
        const validJsonTopic = new sns.Topic(this, 'ValidJsonTopic', {})
        const validJsonSubscription = new Subscription(this, 'ValidJsonSubscription', {
            protocol: SubscriptionProtocol.EMAIL,
            endpoint: 'm.atanasovamarinova@gmail.com',
            topic: validJsonTopic
        });

        const validateJsonObjectLambda = new NodejsFunction(this, 'ValidateJsonObjectLambdaFunction', {
            handler: 'handler',
            runtime: Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '/../src/ValidateJsonObjectHandler.ts'),
            environment: {
                TABLE_NAME: jsonObjectsTable.tableName,
                VALID_JSON_OBJECT_TOPIC_ARN: validJsonTopic.topicArn
            }
        });
        jsonObjectsTable.grantWriteData(validateJsonObjectLambda); //write data should be enough, we only insert entries here, no deletion

        //////////////////////////////////////////////////////
        // CREATE VALID JSON TOPIC + LAMBDA
        const deletedJsonTopic = new sns.Topic(this, 'DeletedJsonTopic', {})
        const deletedJsonSubscription = new Subscription(this, 'DeletedJsonSubscription', {
            protocol: SubscriptionProtocol.EMAIL,
            endpoint: 'm.atanasovamarinova@gmail.com',
            topic: deletedJsonTopic
        });

        const deleteJsonObjectLambda = new NodejsFunction(this, 'DeleteJsonObjectLambdaFunction', {
            handler: 'handler',
            runtime: Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '/../src/DeleteJsonObjectHandler.ts'),
            environment: {
                TABLE_NAME: jsonObjectsTable.tableName,
                DELETED_JSON_OBJECT_TOPIC_ARN: deletedJsonTopic.topicArn
            }
        });
        jsonObjectsTable.grantReadWriteData(deleteJsonObjectLambda); //TODO check if this does the job for deletion
        deleteJsonObjectLambda.addPermission('AllowEventBridgeRuleInvoke', {
            principal: new ServicePrincipal('events.amazon.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/*`,
        });

        //////////////////////////////////////////////////////
        // CREATE REST API with POST ENDPOINT
        const api = new RestApi(this, 'ValidateJsonObjectApi');
        const resource = api.root.addResource('resource');
        resource.addMethod('POST', new LambdaIntegration(validateJsonObjectLambda, {
            proxy: true //needed to obtain all request data
        }));
        //TODO define body schema


        // const validJsonObjectQueue = new sqs.Queue(this, 'ValidJsonObjectQueue', {
        //     visibilityTimeout: Duration.seconds(300),
        //     queueName: 'ExamQueue'
        // })
        //
        //
        // topic.addSubscription(new subs.SqsSubscription(validJsonObjectQueue));
    }

}