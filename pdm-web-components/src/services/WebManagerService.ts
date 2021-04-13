import wizardService from './WizardService';
const Managers = wizardService.Managers;

export interface QueryOptions {
  query?: string[],
  sort?: string,
  limit?: number
}

export interface WebManager {
  getOne(key, readDSU,  callback): void;
  getAll(readDSU, options, callback): void;
}

const bindAsControllerManager = function(manager){
  return new class implements WebManager{
    getOne = manager.getOne.bind(manager);
    getAll = manager.getAll.bind(manager);
  }
}

export const WebManagerService = {
  getWebManager: async managerName => {
    try{
      const manager: WebManager = Managers[`get${managerName}`]();
      return bindAsControllerManager(manager);
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};
