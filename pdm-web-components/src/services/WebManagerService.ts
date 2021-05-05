import wizardService from './WizardService';
const Managers = wizardService.Managers;

export interface QueryOptions {
  query?: string[],
  sort?: string,
  limit?: number
}

export interface WebResolver{
  getOne(key, readDSU,  callback): void;
}

export interface WebManager extends WebResolver{
  getAll(readDSU, options, callback): void;
  getPage(itemsPerPage, page, keyword, sort, readDSU, callback): void;
}

const bindAsControllerManager = function(manager): WebManager{
  return new class implements WebManager {
    getOne = manager.getOne.bind(manager);
    getAll = manager.getAll.bind(manager);
    getPage = manager.getPage.bind(manager);
  }
}

const bindAsControllerResolver = function(resolver): WebManager{
  return new class implements WebManager {
    getOne = resolver.getOne.bind(resolver);
    getAll = () => {
      console.log(`getAll Not available in this Manager`)
    };
    getPage = () => {
      console.log(`getPage Not available in this Manager`)
    };
  }
}

const getWebManager = async function(managerName: string): Promise<WebManager> {
  const changeToResolver = function(name){
    if (name.indexOf("Manager") === -1)
      return name;
    return name.substring(0, managerName.length - "Manager".length) + "Resolver"
  }

  try{
    const getter = `get${managerName}`;
    if (getter in Managers){
      const manager: WebManager = Managers[getter]();
      return bindAsControllerManager(manager);
    } else {
      return getWebResolver(changeToResolver(managerName));
    }
  } catch (e) {
    return getWebResolver(changeToResolver(managerName));
  }
}

const getWebResolver = async function(resolverName: string): Promise<WebManager>{
  try{
    const getter = `get${resolverName}`;
    if (getter in Managers.Resolvers){
      const resolver: WebManager = Managers.Resolvers[getter]();
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
  getWebManager: getWebManager
};
