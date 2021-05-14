import "reflect-metadata";
import { ArtifactClient } from "../../src/interfaces";
import { readFileSync, writeFileSync, PathLike, BaseEncodingOptions } from "fs";
import { IOptions, sync } from "glob";
import * as replaceInFile from "replace-in-file";
import { mock } from "jest-mock-extended";
import * as core from "@actions/core";
import { TaskcatArtifactManagerImpl } from "../../src/taskcat-artifact-manager";

jest.mock("fs");
jest.mock("glob");

describe("the TaskcatArtifactManager class", () => {
  const mockReplaceInFileSync = (replaceInFile.sync as unknown) as jest.SpiedFunction<
    typeof replaceInFile.sync
  >;

  const mockedReadFileSync = (readFileSync as unknown) as jest.MockedFunction<
    typeof readFileSync
  >;

  const mockedWriteFileSync = (writeFileSync as unknown) as jest.MockedFunction<
    typeof writeFileSync
  >;
  const mockedGlobSync = (sync as unknown) as jest.MockedFunction<typeof sync>;

  const mockedArtifactClient = mock<ArtifactClient>();

  const taskcatArtifactManager = new TaskcatArtifactManagerImpl(
    mockedArtifactClient,
    /**
     * Before passing our spy into the TaskcatArtifactManagerImpl object, we
     * cast it back to the replace-in-file.sync type. This allows the
     * parameter's type-checks to pass, while still keeping the SpiedInstance
     * functions available to our tests.
     */
    (mockReplaceInFileSync as unknown) as typeof replaceInFile.sync
  );

  describe("the maskAccountId function", () => {
    it("should not modify the `tasckat_output/` files if the AWS account ID has not been printed in the logs", () => {
      expect.assertions(1);

      const filePath = "taskcat_outputs/";

      const fileContents = "abcd1234";
      const awsAccountId = "1234567890";

      /**
       * The replace-in-file's sync() function calls glob's sync() function to
       * return the list of files in the specified directory.
       *
       * We mock the glob.sync() function to return a file name called
       * "test.txt" when globbing for files under the taskcat_outputs directory.
       */
      mockedGlobSync.mockImplementation(
        (pattern: string, options?: IOptions | undefined) => {
          if (pattern === filePath) return [filePath + "test.txt"];
          else
            throw new Error(
              "Incorrect file pattern passed to the mock implementation"
            );
        }
      );

      /**
       * After the list of matching files have been returned, return some dummy
       * file content based on the provided path.
       *
       * For the purposes of this test, the files do NOT contain the AWS account
       * ID.
       */
      mockedReadFileSync.mockImplementation(
        (
          path: number | PathLike,
          options?:
            | (BaseEncodingOptions & { flag?: string | undefined })
            | BufferEncoding
            | null
            | undefined
        ) => {
          if (path === filePath + "test.txt") return fileContents;
          else
            throw new Error(
              "Incorrect file path passed to the readFileSync function"
            );
        }
      );

      /**
       * Call the maskAccountId function, passing our test.txt file, along with
       * the AWS account ID to mask. The mocked functions are already injected
       * by Jest.
       */
      taskcatArtifactManager.maskAccountId(awsAccountId, filePath);

      /**
       * Because the fileContents does not contain our AWS account ID,
       * replace-in-file should not be making any write operations to our files.
       *
       * If we detect a call to fs.writeFileSync, we fail the test.
       */
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it("should throw an exception if the AWS account ID has been passed as an empty string", () => {
      expect.assertions(2);

      const filePath = "taskcat_outputs/test.txt";
      const awsAccountId = "";

      expect(() => {
        taskcatArtifactManager.maskAccountId(awsAccountId, filePath);
      }).toThrow(Error);

      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it("should mask the AWS account ID from the `taskcat_outputs/` files if any references are found in the logs", () => {
      expect.assertions(1);

      const filePath = "taskcat_outputs/test.txt";
      const fileContents = "abcd1234 1234567890";
      const awsAccountId = "1234567890";

      mockedGlobSync.mockReturnValue(["taskcat_outputs/test.txt"]);
      mockedReadFileSync.mockImplementation((path, options?):
        | string
        | Buffer => {
        if (path === filePath && options === "utf-8") return fileContents;
        else throw new Error();
      });

      taskcatArtifactManager.maskAccountId(awsAccountId, "taskcat_outputs/");

      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        filePath,
        "abcd1234 ***",
        "utf-8"
      );
    });
  });

  describe("the publishTaskcatOutputs function", () => {
    it("should retrieve all files from the taskcat_output directory", () => {
      expect.assertions(1);

      const filePath = "taskcat_outputs/";

      mockedGlobSync.mockImplementation(
        (pattern: string, options?: IOptions | undefined) => {
          if (pattern === `${filePath}*`)
            return [filePath + "test1.txt", filePath + "test2.txt"];
          else throw new Error(`Expected ${filePath} but received ${pattern}`);
        }
      );

      const mockedArtifactClient = mock<ArtifactClient>();

      const taskcatArtifactManager = new TaskcatArtifactManagerImpl(
        mockedArtifactClient,
        replaceInFile.sync
      );

      taskcatArtifactManager.publishTaskcatOutputs("taskcat_outputs/");

      expect(mockedArtifactClient.uploadArtifact).toHaveBeenCalledWith(
        "taskcat_outputs",
        ["taskcat_outputs/test1.txt", "taskcat_outputs/test2.txt"],
        "taskcat_outputs/"
      );
    });
  });

  describe("the maskAndPublishTaskcatArtifacts function", () => {
    it("prints a debug message", () => {
      expect.assertions(1);

      const infoSpy = jest.spyOn(core, "info");

      jest.spyOn(taskcatArtifactManager, "maskAccountId").mockReturnValue();
      jest
        .spyOn(taskcatArtifactManager, "publishTaskcatOutputs")
        .mockReturnValue();

      taskcatArtifactManager.maskAndPublishTaskcatArtifacts("123456789");

      expect(infoSpy).toHaveBeenCalledWith(
        "Entered the maskAndPublishTaskcatArtifacts function"
      );
    });

    it("calls the maskAccountId function", () => {
      expect.assertions(1);

      const spy = jest
        .spyOn(taskcatArtifactManager, "maskAccountId")
        .mockReturnValue();

      taskcatArtifactManager.maskAndPublishTaskcatArtifacts("123456789");

      expect(spy).toHaveBeenCalledWith("123456789", "taskcat_outputs/");
    });

    it("calls the publishTaskcatOutputs function", () => {
      expect.assertions(1);

      process.env = Object.assign(process.env, {
        GITHUB_WORKSPACE: "/github/workspace",
      });

      jest.spyOn(taskcatArtifactManager, "maskAccountId").mockReturnValue();

      const spy = jest
        .spyOn(taskcatArtifactManager, "publishTaskcatOutputs")
        .mockReturnValue();

      taskcatArtifactManager.maskAndPublishTaskcatArtifacts("123456789");

      expect(spy).toHaveBeenCalledWith("/github/workspace/taskcat_outputs/");
    });
  });
});
