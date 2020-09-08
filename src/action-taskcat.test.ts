import cp from "child_process";

describe("integration tests", () => {
  describe("when the AWS credentials are available", () => {
    it("creates a CloudFormation stack", () => {
      expect.assertions(3);

      var actOutput: string;
      var awsAccessKeyId: string | undefined = process.env.AWS_ACCESS_KEY_ID;
      var awsSecretAccessKey: string | undefined =
        process.env.AWS_SECRET_ACCESS_KEY;

      expect(awsAccessKeyId).not.toBeUndefined();
      expect(awsSecretAccessKey).not.toBeUndefined();

      actOutput = cp
        .execSync(
          `act \
        --job taskcat \
        --directory ./src/test/resources/default/ \
        --secret AWS_ACCESS_KEY_ID=${awsAccessKeyId} \
        --secret AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}`
        )
        .toString();

      expect(actOutput).toContain("CREATE_COMPLETE");
    });
  });

  describe("when AWS credentials are missing", () => {
    it("throws a NoCredentialsError exception", () => {
      expect.assertions(2);

      var exitCode: number = 0;
      var actOutput: string = "";

      try {
        cp.execSync(
          `act \
            --job taskcat \
            --directory ./src/test/resources/default/`
        );
      } catch (error) {
        actOutput = error.stdout.toString();
        exitCode = error.status;
      }

      expect(actOutput).toContain(
        "NoCredentialsError Unable to locate credentials"
      );

      expect(exitCode).not.toBe(0);
    });
  });

  describe("when no commands are passed", () => {
    it("prints a help message", () => {
      expect.assertions(1);

      var actOutput: string;

      actOutput = cp
        .execSync(`act --job taskcat --directory ./src/test/resources/help/`)
        .toString();

      expect(actOutput).toContain(
        "taskcat is a tool that tests AWS CloudFormation templates."
      );
    });
  });
});
