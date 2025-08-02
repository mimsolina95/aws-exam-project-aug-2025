# aws-exam-project-aug-2025
This is a repository that contains a project for deploying an app on AWS for SoftUni exam August 2025
!!!!!!!!!add tagging

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Cost Estimation
- default region is eu-central-1
- 3M queries per month 
- 2MB image per each 
- monthly estimation

API Gateway: 
    ~ 3M queries * $1.2 each = ~ $3.6  (First 300M queries cost $1.2)

AWS Lambda: 
    ~ 3M queries from API Gateway + 3M queries from EventBridge
    128MB (0.125GB) * ~0.9s (avg.req.speed) = ~ 337.500 GB-second
    $4.50

Amazon S3: 
    3M * 2MB each entry ~ 6000GB
    price per GB $0.0245
    storage: 6000 GB * $0.0245 ~ $150
    GET requests: 6M requests * $0.00043 per 1000 ~ $2.58

DynamoDB: 
    Index: 

EventBridge: 
    Rule: 
    Schedule: 

GitHub Actions: 
    500MB storage
    2000 min monthly



