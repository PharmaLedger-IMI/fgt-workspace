import wizardService from './WizardService';
const Managers = wizardService.Managers;

export interface QueryOptions {
  query?: (item) => boolean,
  sort?: string,
  limit?: number
}

export interface ControllerManager {
  getOne(key, readDSU,  callback): void;
  getAll(readDSU, options, callback): void;
}

export const WebManagerService = {
  getWebManager: async managerName => {
    console.log(Object.keys(Managers) + ` ${managerName}`)
    try{
      const manager: ControllerManager = Managers[`get${managerName}`]();
      return manager;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};
