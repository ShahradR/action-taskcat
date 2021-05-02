import { prodContainer } from "./inversify.config";

function bindDependencies(func, dependencies) {
  let injections = dependencies.map((dependency) => {
    return prodContainer.get(dependency);
  });
  return func.bind(func, ...injections);
}

export { bindDependencies };
