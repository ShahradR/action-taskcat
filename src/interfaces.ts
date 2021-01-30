import * as artifact from "@actions/artifact";

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
