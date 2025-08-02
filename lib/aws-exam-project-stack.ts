import {Stack, StackProps} from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import {Subscription, SubscriptionProtocol} from "aws-cdk-lib/aws-sns";
import {Construct} from "constructs";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "node:path";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class AwsExamProjectStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, 'StoreSomethingBucket');

        const smthTable = new Table(this, 'items', {
            partitionKey: {
                name: 'PK',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST //or provisioned
        })

        smthTable.addGlobalSecondaryIndex({
            indexName: 'search-by-prop',
            partitionKey: {
                name: 'prop',
                type: AttributeType.STRING
            }
        });

        const doSomethingTopic = new sns.Topic(this, 'DoSomethingTopic', {})

        const subscription = new Subscription(this, 'DoSomethingSubscription', {
            protocol: SubscriptionProtocol.EMAIL,
            endpoint: 'mimsolina95@gmail.com',
            topic: doSomethingTopic
        });

        const doSomethingLambda = new NodejsFunction(this, 'DoSomethingLambdaFunction', {
            handler: 'handler',
            runtime: Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '/../src/FirstHandler.ts'),
            environment: {
                TABLE_NAME: smthTable.tableName
            }
        });
        smthTable.grantWriteData(doSomethingLambda);
        //smthTable.grantReadData(doSomethingLambda); //multiple func

        const doSecondJobLambda = new NodejsFunction(this, 'doSecondJobLambdaFunction', {
            handler: 'handler',
            runtime: Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '/../src/SecondHandler.ts'),
            environment: {

            }
        });
        doSecondJobLambda.addPermission('AllowEventBridgeRuleInvoke', {
            principal: new ServicePrincipal('events.amazon.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/*`,
        })

        const api = new RestApi(this, 'DoSomethingApi');
        const resource = api.root.addResource('resource');
        resource.addMethod('GET', new LambdaIntegration(doSomethingLambda, {
            proxy: true //needed to obtain all request data
        }));

        // const queue = new sqs.Queue(this, 'Queue', {
        //     visibilityTimeout: Duration.seconds(300),
        //     queueName: 'ExamQueue'
        // })
        //
        //
        // topic.addSubscription(new subs.SqsSubscription(queue));
    }

}