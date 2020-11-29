# Mocking AWS calls using the moto server

tasckat uses boto3 to communicate with AWS. Because taskcat is treated as a black box, its code can't be modified to inject mocks and abstract the AWS cloud.

The [spulec/moto project][moto-github] provides a server which mocks AWS service endpoints. While originally designed to allow tests for non-Python projects, it can be leveraged to trick boto3 into calling the fake moto endpoints, forcing certain outputs from taskcat, and testing the GitHub Action's response to those outputs.

![image](images/moto-test-overview.svg)

## The boto3 architecture

boto3 is a wrapper around the botocore library. While both provide a way of communicating with AWS service endpoints, boto3 exposes service endpoints through a high-level `Resources` object, providing OOP-like functions for actions that can be taken against an AWS resource. boto3 objects use a botocore `Client` object, which manages the low-level technical aspects of the connection.

The slide below shows the relationship between boto3 and botocore.

[![(DEV307) Introduction to Version 3 of the AWS SDK for Python (Boto) | AWS re:Invent 2014](https://image.slidesharecdn.com/dev307-141118134610-conversion-gate02/95/dev307-introduction-to-version-3-of-the-aws-sdk-for-python-boto-aws-reinvent-2014-8-638.jpg)][slideshare-boto3]

For additional information, see the following resources:

- **AWS re:Invent 2014 | (DEV307) Introduction to Version 3 of the AWS SDK for Python (Boto)**
  - [YouTube][youtube-boto3]
  - [SlideShare][slideshare-boto3]
- [**Difference in boto3 between resource, client, and session?** (StackOverflow)][stackoverflow-boto3]

[moto-github]: https://github.com/spulec/moto
[aws-configure-add-model]: https://docs.aws.amazon.com/cli/latest/reference/configure/add-model.html
[youtube-boto3]: https://www.youtube.com/watch?v=Cb2czfCV4Dg
[slideshare-boto3]: www.slideshare.net/AmazonWebServices/dev307-introduction-to-version-3-of-the-aws-sdk-for-python-boto-aws-reinvent-2014
[stackoverflow-boto3]: https://stackoverflow.com/questions/42809096/difference-in-boto3-between-resource-client-and-session
