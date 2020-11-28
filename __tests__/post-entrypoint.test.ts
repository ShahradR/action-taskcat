import { TaskcatArtifactManager } from "../src/post-entrypoint";
import { readFileSync, writeFileSync } from "fs";
import { sync } from "glob";

jest.mock("fs");
jest.mock("glob");

describe("the maskAccountId() function", () => {
  const taskcatArtifactManager: TaskcatArtifactManager = new TaskcatArtifactManager();

  const mockedReadFileSync = (readFileSync as unknown) as jest.MockedFunction<
    typeof readFileSync
  >;
  const mockedWriteFileSync = (writeFileSync as unknown) as jest.MockedFunction<
    typeof writeFileSync
  >;
  const mockedGlobSync = (sync as unknown) as jest.MockedFunction<typeof sync>;

  it("should not modify the `tasckat_output/` files if the AWS account ID has not been printed in the logs", () => {
    expect.assertions(1);
    jest.clearAllMocks();

    const filePath = "taskcat_outputs/";
    const fileContents = "abcd1234";
    const awsAccountId = "1234567890";

    mockedGlobSync.mockReturnValue(["taskcat_outputs/test.txt"]);
    mockedReadFileSync.mockReturnValue(fileContents);

    taskcatArtifactManager.maskAccountId(awsAccountId, filePath);

    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("should throw an exception if the AWS account ID has been passed as an empty string", () => {
    expect.assertions(2);
    jest.clearAllMocks();

    const filePath = "taskcat_outputs/test.txt";
    const awsAccountId = "";

    expect(() => {
      taskcatArtifactManager.maskAccountId(awsAccountId, filePath);
    }).toThrow(Error);

    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("should mask the AWS account ID from the `taskcat_outputs/` files if any references are found in the logs", () => {
    expect.assertions(1);
    jest.clearAllMocks();

    const filePath = "taskcat_outputs/test.txt";
    const fileContents = "abcd1234 1234567890";
    const awsAccountId = "1234567890";

    mockedGlobSync.mockReturnValue(["taskcat_outputs/test.txt"]);
    mockedReadFileSync.mockImplementation((path, options?): string | Buffer => {
      if (path === filePath && options === "utf-8") return fileContents;

      throw new Error();
    });

    taskcatArtifactManager.maskAccountId(awsAccountId, "taskcat_outputs/");

    expect(mockedWriteFileSync).toHaveBeenCalledWith(
      filePath,
      "abcd1234 ***",
      "utf-8"
    );
  });
});
