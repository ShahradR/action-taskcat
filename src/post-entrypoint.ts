import { ReplaceInFileConfig, sync } from "replace-in-file";

/**
 * Manages the artifacts generated by the taskcat GitHub Action.
 */
class TaskcatArtifactManager {
  /**
   * Masks the AWS account ID from the taskcat_output logs.
   *
   * @throws {@link Error} Thrown if the AWS account ID is an empty string.
   *
   * @param awsAccountId - the AWS account ID to mask in the logs.
   * @param filePath - the file path to the `taskcat_outputs` directory.
   */
  public maskAccountId(awsAccountId: string, filePath: string): void {
    if (awsAccountId === "") {
      throw new Error();
    }

    const replaceOptions: ReplaceInFileConfig = {
      files: filePath,
      from: awsAccountId,
      to: "***",
    };

    sync(replaceOptions);
  }
}

export { TaskcatArtifactManager };
