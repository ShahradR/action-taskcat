# action-taskcat

[![Tests](https://img.shields.io/github/workflow/status/ShahradR/action-taskcat/CI%20workflow?logo=github)](https://github.com/ShahradR/action-taskcat/actions?query=workflow%3ATests) [![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ShahradR_action-taskcat&metric=alert_status)](https://sonarcloud.io/dashboard?id=ShahradR_action-taskcat)

The unofficial GitHub Action to run [taskcat] tests and validate your AWS CloudFormation templates by deploying them in different AWS regions and availability zones!

> Looking for the official taskcat project? Check out the [aws-quickstart/taskcat][taskcat] repository! This repository covers issues and work relating specifically to the GitHub Action running taskcat.

## Usage

To use this action, configure your workflow and repository to ensure that:

1. A `.taskcat.yml` file is present in the project's root directory
2. The [`aws-actions/configure-aws-credentials` action][configure-aws-credentials] is used to configure the environment variables
   - This official AWS action configures your credentials and makes them available to subsequent tasks
   - This action also masks the AWS account ID in the job output, which can help mitigate certain security issues (see [Managing credentials](#managing-credentials) below)
3. The `ShahradR/action-taskcat` action is called to run taskcat
   - The `command` input includes the `taskcat` command to run, including a call to the application itself. To see a full list of commands made available by taskcat, run `taskcat --help`
4. (Optional) The [`actions/upload-artifact` action][upload-artifact] is used to output the `taskcat_outputs` files as artifacts
   - The account ID mask doesn't apply to the `taskcat_outputs` logs—there is a potential risk of exposing the AWS account IDs if they're used by (see [Managing credentials](#managing-credentials) below).

### Example: Running `taskcat test run`

In this scenario, is ran `taskcat test run` against the CloudFormation templates. The YAML file below should be saved in the `.github/workflow/` directory in (the YAML file itself can be given any name).

The repository is also configured with two secrets—the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are used by the `aws-actions/configure-aws-credentials` action to authenticate against AWS, and make that information available to this action.

See [ShahradR/s3-logging][s3-logging-repo] for an example of how this action can be used to test the deployment of a CloudFormation template that creates an S3 bucket.

```yaml
name: Integration tests

on: [push, pull_request]

jobs:
  taskcat:
    name: Run taskcat tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ca-central-1
      - name: Run taskcat test run
        uses: ShahradR/action-taskcat@v1
        with:
          commands: test run
```

## Managing credentials

The `configure-aws-credentials` action is used to manage AWS credentials—this official action from Amazon allows for many different ways to configure and manage AWS authentication. The action also masks the account ID from the GitHub action outputs, preventing security issues [like the potential for IAM account enumeration, as outlined by this Rhino Security Labs blog post][rhino-sec-labs-iam-account-id].

The mask is applied to all subsequent actions, eliminating the need for this action to apply logic to obfuscate the account ID in the logs.

That being said, the mask isn't applied to the `taskcat_outputs` logs. While taskcat doesn't write the account ID into the logs, if a CloudFormation resource references the account ID and that information is outputed during a stack event, the account ID will be printed in clear-text. This will be managed in a future release of this action, but if you expect to run CloudFormation templates which may result in the AWS account ID being printed in the `taskcat_outputs` logs, consider not using the `create-artifact` action, or calling a task which will find and replace the account ID.

If you believe your outputs are safe to publish, you can store the `taskcat_outputs` directory as an artifact using the following task:

```yaml
- uses: actions/upload-artifact@v2
  if: ${{ always() }}
  with:
    name: taskcat_outputs
    path: ${{ github.workspace }}/taskcat_outputs/
```

[taskcat]: https://github.com/aws-quickstart/taskcat
[s3-logging-repo]: https://github.com/ShahradR/s3-logging/
[configure-aws-credentials]: https://github.com/aws-actions/configure-aws-credentials
[upload-artifact]: https://github.com/actions/upload-artifact
[rhino-sec-labs-iam-account-id]: https://rhinosecuritylabs.com/aws/aws-iam-user-enumeration/
