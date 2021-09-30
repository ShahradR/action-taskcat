import cp from "child_process";

describe("integration tests", () => {
  describe("when the AWS credentials are available", () => {
    it("creates a CloudFormation stack", () => {
      expect.assertions(3);

      const awsAccessKeyId: string | undefined = process.env.AWS_ACCESS_KEY_ID;
      const awsSecretAccessKey: string | undefined =
        process.env.AWS_SECRET_ACCESS_KEY;

      expect(awsAccessKeyId).not.toBeUndefined();
      expect(awsSecretAccessKey).not.toBeUndefined();

      const actOutput: string = cp
        .execSync(
          `act \
        --job taskcat \
        --directory ./e2e/resources/default/ \
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

      let exitCode = 0;
      let actOutput = "";

      try {
        actOutput = cp
          .execSync(
            `act \
            --job taskcat \
            --directory ./e2e/resources/default/`
          )
          .toString();
      } catch (error: any) {
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

      const actOutput: string = cp
        .execSync(`act --job taskcat --directory ./e2e/resources/help/`)
        .toString();

      expect(actOutput).toContain(
        "taskcat is a tool that tests AWS CloudFormation templates."
      );
    });
  });

  describe("when update_taskcat is set to true", () => {
    it("runs the latest version of taskcat", () => {
      expect.assertions(3);

      const awsAccessKeyId: string | undefined = process.env.AWS_ACCESS_KEY_ID;
      const awsSecretAccessKey: string | undefined =
        process.env.AWS_SECRET_ACCESS_KEY;

      expect(awsAccessKeyId).not.toBeUndefined();
      expect(awsSecretAccessKey).not.toBeUndefined();

      const actOutput: string = cp
        .execSync(
          `act \
        --job taskcat \
        --directory ./e2e/resources/taskcat_upgrade/true/ \
        --secret AWS_ACCESS_KEY_ID=${awsAccessKeyId} \
        --secret AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}`
        )
        .toString();

      expect(actOutput).not.toContain(
        "A newer version of taskcat is available"
      );
    });
  });

  describe("when update_taskcat is set to false", () => {
    it("runs an older version of taskcat", () => {
      expect.assertions(3);

      const awsAccessKeyId: string | undefined = process.env.AWS_ACCESS_KEY_ID;
      const awsSecretAccessKey: string | undefined =
        process.env.AWS_SECRET_ACCESS_KEY;

      expect(awsAccessKeyId).not.toBeUndefined();
      expect(awsSecretAccessKey).not.toBeUndefined();

      const actOutput: string = cp
        .execSync(
          `act \
        --job taskcat \
        --directory ./e2e/resources/taskcat_upgrade/false/ \
        --secret AWS_ACCESS_KEY_ID=${awsAccessKeyId} \
        --secret AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}`
        )
        .toString();

      expect(actOutput).toContain("A newer version of taskcat is available");
    });
  });
});
