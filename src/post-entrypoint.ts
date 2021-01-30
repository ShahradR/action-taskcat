import cp from "child_process";
import { prodContainer } from "./inversify.config";
import { TaskcatArtifactManager } from "./interfaces";
import { TYPES } from "./types";
import * as artifact from "@actions/artifact";
import * as core from "@actions/core";

function run() {
  const artifactClient = artifact.create();
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
    const taskcatArtifactManager = prodContainer.get<TaskcatArtifactManager>(
      TYPES.TaskcatArtifactManager
    );
    taskcatArtifactManager.maskAndPublishTaskcatArtifacts(
      awsAccountId,
      artifactClient
    );

    if (exitCode !== 0) {
      core.setFailed("The taskcat test did not complete successfully.");
    }
  });
}

run();
