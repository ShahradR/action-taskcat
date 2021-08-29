import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import * as cp from "child_process";

export interface PostEntrypoint {
  run(): void;
}

export interface TaskcatArtifactManager {
  maskAndPublishTaskcatArtifacts(awsAccountId: string): void;
  maskAccountId(awsAccountId: string, filePath: string): void;
  publishTaskcatOutputs(filePath: string): void;
}

export type Artifact = typeof artifact;

export type Core = typeof core;

export type ChildProcess = typeof cp;

export type ArtifactClient = artifact.ArtifactClient;
