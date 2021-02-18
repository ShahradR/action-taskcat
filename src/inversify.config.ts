import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import {
  TaskcatArtifactManager,
  Artifact,
  PostEntrypoint,
  Core,
  ChildProcess,
  ArtifactClient,
} from "./interfaces";
import { TaskcatArtifactManagerImpl } from "./taskcat-artifact-manager";
import { PostEntrypointImpl } from "./post-entrypoint";
import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import * as cp from "child_process";
import { DefaultArtifactClient } from "@actions/artifact/lib/internal/artifact-client";

const prodContainer = new Container();

prodContainer
  .bind<TaskcatArtifactManager>(TYPES.TaskcatArtifactManager)
  .to(TaskcatArtifactManagerImpl);

prodContainer.bind<Artifact>(TYPES.Artifact).toConstantValue(artifact);
prodContainer.bind<Core>(TYPES.Core).toConstantValue(core);

prodContainer.bind<ChildProcess>(TYPES.ChildProcess).toConstantValue(cp);

prodContainer.bind<PostEntrypoint>(TYPES.PostEntrypoint).to(PostEntrypointImpl);

prodContainer.bind<ArtifactClient>(TYPES.ArtifactClient).to(DefaultArtifactClient);

export { prodContainer };
