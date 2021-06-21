import wizardService from './WizardService';
const Managers = wizardService.Managers;

const WebResolverMaxTimeout = 100;

/**
 * @module Services.WebManager
 * @interface QueryOptions
 */
export interface QueryOptions {
  query?: string[],
  sort?: string,
  limit?: number
}

/**
 * @module Services.WebManager
 * @interface WebResolver
 */
export interface WebResolver{
  getOne(key, readDSU,  callback): void;
}

/**
 * @module Services.WebManager
 * @interface WebManager
 */
export interface WebManager extends WebResolver{
  getAll(readDSU, options, callback): void;
  getPage(itemsPerPage, page, keyword, sort, readDSU, callback): void;
}

/**
 * @module Services.WebManager
 */
const bindAsControllerManager = function(manager): WebManager{
  return new class implements WebManager {
    getOne = manager.getOne.bind(manager);
    getAll = manager.getAll.bind(manager);
    getPage = manager.getPage.bind(manager);
  }
}

/**
 * Hack so many simultaneous requests to generate a Key and load its DSU dont freeze the UI
 * @param resolver
 * @module Services.WebManager
 */
const delayRequest = function(resolver: WebResolver){
  return function(...args){
    setTimeout(() => {
      resolver.getOne.call(resolver, ...args);
    }, Math.floor(Math.random() * WebResolverMaxTimeout));
  }
}

/**
 * @module Services.WebManager
 */
const bindAsControllerResolver = function(resolver): WebManager{
  return new class implements WebManager {
    getOne = delayRequest(resolver);
    getAll = () => {
      console.log(`getAll Not available in this Manager`)
    };
    getPage = () => {
      console.log(`getPage Not available in this Manager`)
    };
  }
}

let webManagerRepository = undefined;

/**
 * @module Services.WebManager
 */
const registerManagerRepository = function(repo){
  webManagerRepository = {
    getManager: repo.getManager.bind(repo),
    cacheManager: repo.cacheManager.bind(repo)
  };
}

/**
 * @module Services.WebManager
 */
const changeToResolver = function(name){
  if (name.indexOf("Manager") === -1)
    return name;
  return name.substring(0,name.length - "Manager".length) + "Resolver"
}

/**
 * Tries to get the Previously Instantiated WebManager by Name.
 * If unable falls back to the matching WebSResolver
 * @param managerName
 * @module Services.WebManager
 */
const getWebManager = async function(managerName: string): Promise<WebManager> {
  try{
    const getter = `get${managerName}`;
    if (getter in Managers) {
      const manager: WebManager = Managers[getter](webManagerRepository);
      return bindAsControllerManager(manager);
    } else {
      return getWebResolver(changeToResolver(managerName));
    }
  } catch (e) {
    return getWebResolver(changeToResolver(managerName));
  }
}

/**
 * @module Services.WebManager
 */
const getWebResolver = async function(resolverName: string): Promise<WebManager>{
  try{
    const getter = `get${resolverName}`;
    if (getter in Managers.Resolvers){
      const resolver: WebManager = Managers.Resolvers[getter](webManagerRepository);
      return bindAsControllerResolver(resolver);
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

export const WebManagerService = {
  registerRepository: registerManagerRepository,
  getWebManager: getWebManager
};
