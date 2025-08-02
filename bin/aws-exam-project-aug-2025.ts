#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib';
import {AwsExamProjectStack} from "../lib/aws-exam-project-stack";

const app = new cdk.App();
const examStack = new AwsExamProjectStack(app, 'AwsExamProjectStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});