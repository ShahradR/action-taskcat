import { ArtifactClient } from "@actions/artifact";

export interface TaskcatArtifactManager {
  maskAndPublishTaskcatArtifacts(
    awsAccountId: string,
    artifactClient: ArtifactClient
  ): void;
  maskAccountId(awsAccountId: string, filePath: string): void;
  publishTaskcatOutputs(artifactClient: ArtifactClient, filePath: string): void;
}
