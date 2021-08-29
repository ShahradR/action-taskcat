import "reflect-metadata";
import { PostEntrypoint } from "../src/interfaces";
import { TYPES } from "../src/types";
import { prodContainer } from "../src/inversify.config";
import { PostEntrypointImpl } from "../src/post-entrypoint";
import { DefaultArtifactClient } from "@actions/artifact/lib/internal/artifact-client";
import * as artifact from "@actions/artifact";
import * as core from "@actions/core";

import * as cp from "child_process";
import { TaskcatArtifactManagerImpl } from "../src/taskcat-artifact-manager";

import { sync } from "replace-in-file";

describe("the IoC container", () => {
  it("should return a properly constructed PostEntrypoint object", () => {
    expect.assertions(1);

    const spy = jest.spyOn(prodContainer, "get");

    prodContainer.get<PostEntrypoint>(TYPES.PostEntrypoint);

    expect(spy).toHaveReturnedWith<PostEntrypoint>(
      new PostEntrypointImpl(
        artifact,
        core,
        cp,
        new TaskcatArtifactManagerImpl(new DefaultArtifactClient(), sync)
      )
    );
  });
});
