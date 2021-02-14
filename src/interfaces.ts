import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import * as cp from "child_process";

export interface PostEntrypoint {
  run(): void;
}

export interface TaskcatArtifactManager {
  maskAndPublishTaskcatArtifacts(
    awsAccountId: string,
    artifactClient: artifact.ArtifactClient
  ): void;
  maskAccountId(awsAccountId: string, filePath: string): void;
  publishTaskcatOutputs(
    artifactClient: artifact.ArtifactClient,
    filePath: string
  ): void;
}

export type Artifact = typeof artifact;

export type Core = typeof core;

export type ChildProcess = typeof cp;
