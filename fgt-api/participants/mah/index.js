
const init = function(server){
    const path = require('path');
    const cmdsDir = path.join(__dirname, "api");
    require('fs').readdir(cmdsDir, (err, files) => {
        if (err)
            throw err;
        files.filter(f => f !== 'index.js').forEach(f => {
            require(path.join(cmdsDir, f)).command(server);
        });
    });
}