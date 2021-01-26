import cp from "child_process";
import { TaskcatArtifactManager } from "./taskcat-artifact-manager";
import * as artifact from "@actions/artifact";
import * as core from "@actions/core";

function run() {
  const artifactClient = artifact.create();
  const awsAccountId = core.getInput("aws-account-id");
  const taskcatCommands = core.getInput("commands");

  cp.execSync("taskcat " + taskcatCommands);

  const taskcatArtifactManager = new TaskcatArtifactManager();
  taskcatArtifactManager.maskAndPublishTaskcatArtifacts(
    awsAccountId,
    artifactClient
  );
}

run();
