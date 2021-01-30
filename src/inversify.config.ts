import { Container } from "inversify";
import { TYPES } from "./types";
import { TaskcatArtifactManager } from "./interfaces";
import { TaskcatArtifactManagerImpl } from "./taskcat-artifact-manager";

const prodContainer = new Container();
prodContainer
  .bind<TaskcatArtifactManager>(TYPES.TaskcatArtifactManager)
  .to(TaskcatArtifactManagerImpl);

export { prodContainer };
