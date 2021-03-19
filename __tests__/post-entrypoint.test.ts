describe("the PostEntrypoint class", () => {
  describe("the main function", () => {
    it.todo("should invoke taskcat");
    it.todo(
      "should mark the run as failed if taskcat returns with a non-zero exit code"
    );
    it.todo(
      "should mark the run as successful if taskcat returns with an exit code of 0"
    );
    it.todo("should redirect standard and error outputs to the console");
    it.todo("should upload the taskcat reports as an artifact");
    it.todo("should mask the AWS account ID from the taskcat reports");
  });
});
