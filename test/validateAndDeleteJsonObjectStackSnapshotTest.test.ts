import {App} from "aws-cdk-lib";
import {AwsExamProjectStack} from "../lib/aws-exam-project-stack";
import {Template} from "aws-cdk-lib/assertions";

test("Try out my app behaviour", () => {
    const app = new App();
    const stack = new AwsExamProjectStack(app, 'SnapshotTestStack');
    const template = Template.fromStack(stack)

    expect(template).toMatchSnapshot();
})