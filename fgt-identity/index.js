function Init(server){
    const path = require('path');
    const middlewaresDir = path.join(__dirname, "middlewares");
    require('fs').readdir(middlewaresDir, (err, files) => {
        if (err)
            throw err;
        files.forEach(f => {
            require(path.join(middlewaresDir, f))(server);
        });
    });
}

module.exports = {
    Init,
};
