import "reflect-metadata";
import { ArtifactClient } from "../src/interfaces";
import * as replaceInFile from "replace-in-file";
import { mock } from "jest-mock-extended";
import * as core from "@actions/core";
import { TaskcatArtifactManagerImpl } from "../src/taskcat-artifact-manager";

describe("the TaskcatArtifactManager class", () => {
  const mockReplaceInFileSync = (replaceInFile.sync as unknown) as jest.MockedFunction<
    typeof replaceInFile.sync
  >;

  const mockedArtifactClient = mock<ArtifactClient>();

  const taskcatArtifactManager = new TaskcatArtifactManagerImpl(
    mockedArtifactClient,
    mockReplaceInFileSync
  );

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
