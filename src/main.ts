import { PostEntrypoint } from "./interfaces";
import { TYPES } from "./types";
import { prodContainer } from "./inversify.config";

const postEntrypoint = prodContainer.get<PostEntrypoint>(TYPES.PostEntrypoint);

postEntrypoint.run();
