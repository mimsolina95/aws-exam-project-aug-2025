// import {CfnOutput, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
// import {Construct} from "constructs";
// import * as path from "node:path";
// import {Bucket, EventType} from "aws-cdk-lib/aws-s3";
// import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
// import {SnsDestination} from "aws-cdk-lib/aws-s3-notifications";
// import {Subscription, SubscriptionProtocol, Topic} from "aws-cdk-lib/aws-sns";
//
// export class StaticWebsiteStack extends Stack {
//     constructor(scope: Construct, id: string, props?: StackProps) {
//         super(scope, id, props);
//
//         const websiteBucket = new Bucket(this, 'staticWebSiteBucket', {
//             publicReadAccess: true,
//             websiteIndexDocument: 'index.html',
//             blockPublicAccess: {
//                 blockPublicAcls: false,
//                 blockPublicPolicy: false,
//                 restrictPublicBuckets: false,
//                 ignorePublicAcls: false
//             },
//             removalPolicy: RemovalPolicy.RETAIN
//         });
//
//         const bucketDeployment = new BucketDeployment(this, 'staticWebSiteBucket', {
//             sources: [Source.asset(path.join(__dirname, '../website-assets'))],
//             destinationBucket: websiteBucket
//         });
//
//         const storageBucket = new Bucket(this, 'storageBucket', {
//             lifecycleRules: [
//                 {
//                     id: 'DeleteAfterOneDay',
//                     expiration: Duration.days(1)
//                 }
//             ]
//         });
//
//         const fileUploadTopic = new Topic(this, 'fileUploadTopic');
//         const subscriptioN = new Subscription(this, 'fileUploadSubscription', {
//             topic: fileUploadTopic,
//             protocol: SubscriptionProtocol.EMAIL,
//             endpoint: 'mimsolina95@gmail.com',
//         })
//
//         storageBucket.addEventNotification(EventType.OBJECT_CREATED, new SnsDestination(fileUploadTopic));
//
//         new CfnOutput(this, 'url', {
//             key: 'appropriateUrl',
//             value: websiteBucket.bucketWebsiteUrl + '/index.html'
//         })
//     }
//
//
// }