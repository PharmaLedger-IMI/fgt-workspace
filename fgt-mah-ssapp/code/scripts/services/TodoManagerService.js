import DSUStorage from "../../cardinal/controllers/base-controllers/lib/DSUStorage.js";

class TodoManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    createToDo(todo, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "toDoSwarm", "createToDo", todo).onReturn(callback);
    }

    removeToDo(todoPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "toDoSwarm", "removeToDo", todoPath).onReturn(callback);
    }

    editToDo(todo, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "toDoSwarm", "editToDo", todo).onReturn(callback);
    }

    listToDos(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "toDoSwarm", "listToDos").onReturn(callback);
    }
}

let todoManagerService = new TodoManagerService();
let getTodoManagerServiceInstance = function () {
    return todoManagerService;
}

export {
    getTodoManagerServiceInstance
};