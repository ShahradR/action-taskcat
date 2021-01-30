import cp from "child_process";
import { prodContainer } from "./inversify.config";
import { PostEntrypoint, TaskcatArtifactManager, Artifact } from "./interfaces";
import { TYPES } from "./types";
import * as core from "@actions/core";
import { inject, injectable } from "inversify";

@injectable()
export class PostEntrypointImpl implements PostEntrypoint {
  private _artifact: Artifact;
  private _taskcatArtifactManager: TaskcatArtifactManager;

  public constructor(
    @inject(TYPES.Artifact) artifact: Artifact,
    @inject(TYPES.TaskcatArtifactManager)
    taskcatArtifactManager: TaskcatArtifactManager
  ) {
    this._artifact = artifact;
    this._taskcatArtifactManager = taskcatArtifactManager;
  }

  public run() {
    const awsAccountId = core.getInput("aws-account-id");
    const taskcatCommands = core.getInput("commands");
    core.info("Received commands: " + taskcatCommands);

    const newList = taskcatCommands.split(" ");
    newList.push("--minimal-output");

    const child = cp.spawn("taskcat", newList, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");
    child.stderr.pipe(process.stdout);

    child.stdout.on("data", (data) => {
      core.info(data);
    });

    child.on("exit", (exitCode) => {
      this._taskcatArtifactManager.maskAndPublishTaskcatArtifacts(
        awsAccountId,
        this._artifact.create()
      );

      if (exitCode !== 0) {
        core.setFailed("The taskcat test did not complete successfully.");
      }
    });
  }
}

const postEntrypoint = prodContainer.get<PostEntrypoint>(
  TYPES.PostEntrypoint
);

postEntrypoint.run();
