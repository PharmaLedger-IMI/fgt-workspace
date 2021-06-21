import { w as wizard } from './WizardService-ed66842b.js';

const Managers = wizard.Managers;
const WebResolverMaxTimeout = 100;
/**
 * @module Services.WebManager
 */
const bindAsControllerManager = function (manager) {
  return new class {
    constructor() {
      this.getOne = manager.getOne.bind(manager);
      this.getAll = manager.getAll.bind(manager);
      this.getPage = manager.getPage.bind(manager);
    }
  };
};
/**
 * Hack so many simultaneous requests to generate a Key and load its DSU dont freeze the UI
 * @param resolver
 * @module Services.WebManager
 */
const delayRequest = function (resolver) {
  return function (...args) {
    setTimeout(() => {
      resolver.getOne.call(resolver, ...args);
    }, Math.floor(Math.random() * WebResolverMaxTimeout));
  };
};
/**
 * @module Services.WebManager
 */
const bindAsControllerResolver = function (resolver) {
  return new class {
    constructor() {
      this.getOne = delayRequest(resolver);
      this.getAll = () => {
        console.log(`getAll Not available in this Manager`);
      };
      this.getPage = () => {
        console.log(`getPage Not available in this Manager`);
      };
    }
  };
};
let webManagerRepository = undefined;
/**
 * @module Services.WebManager
 */
const registerManagerRepository = function (repo) {
  webManagerRepository = {
    getManager: repo.getManager.bind(repo),
    cacheManager: repo.cacheManager.bind(repo)
  };
};
/**
 * @module Services.WebManager
 */
const changeToResolver = function (name) {
  if (name.indexOf("Manager") === -1)
    return name;
  return name.substring(0, name.length - "Manager".length) + "Resolver";
};
/**
 * Tries to get the Previously Instantiated WebManager by Name.
 * If unable falls back to the matching WebSResolver
 * @param managerName
 * @module Services.WebManager
 */
const getWebManager = async function (managerName) {
  try {
    const getter = `get${managerName}`;
    if (getter in Managers) {
      const manager = Managers[getter](webManagerRepository);
      return bindAsControllerManager(manager);
    }
    else {
      return getWebResolver(changeToResolver(managerName));
    }
  }
  catch (e) {
    return getWebResolver(changeToResolver(managerName));
  }
};
/**
 * @module Services.WebManager
 */
const getWebResolver = async function (resolverName) {
  try {
    const getter = `get${resolverName}`;
    if (getter in Managers.Resolvers) {
      const resolver = Managers.Resolvers[getter](webManagerRepository);
      return bindAsControllerResolver(resolver);
    }
    else {
      return null;
    }
  }
  catch (e) {
    console.log(e);
    return null;
  }
};
const WebManagerService = {
  registerRepository: registerManagerRepository,
  getWebManager: getWebManager
};

export { WebManagerService as W };
