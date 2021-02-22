function Init(server){
    const path = require('path');
    const middlewaresDir = path.join(__dirname, "middlewares");
    let files = require('fs').readdirSync(middlewaresDir);
    files.forEach(f => {
        require(path.join(middlewaresDir, f))(server);
    });
}

module.exports = {
    Init,
};
