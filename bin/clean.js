let myPath = process.argv[2];

let fs = require('fs');
let path = require('path');

function  walk(dir, filterFiles, filterFolders, done) {
    let results = [];

    let recWalk = function(dir, filterFiles, filterFolders, done) {
        fs.readdir(dir, function(err, list) {
            if (err) return done(err, result);
            let i = 0;
            (function next() {
                let file = list[i++];
                if (!file) return done(null, results);
                file = path.resolve(dir, file);
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        if(filterFolders(file)) {
                            results.push(file);
                        }
                        recWalk(file, filterFiles, filterFolders,function(err, res) {
                            next();
                        });
                    } else {
                        if(filterFiles(file)) {
                            results.push(file);
                        }
                        next();
                    }
                });
            })();
        });
    };

    recWalk(dir, filterFiles, filterFolders, done);
}




function filterFiles(name){

    if(name.endsWith("\\seed") || name.endsWith("/seed")){
            console.log("Deleting seed file:", name);
            fs.unlinkSync(name);
        }
    return undefined;
}


function deleteFolderContent(name, text){
    console.log(text, name);
    walk(name,
        function(name){
            fs.unlinkSync(name);
        },
        function(name){
        },
        function(err, result){}
        );
}

function filterFolders(name){
    if(name){
        if(name.endsWith("/anchors") || name.endsWith("\\anchors")){
            deleteFolderContent(name, "Deleting anchors:")
        }

        // if(name.endsWith("/bundles") || name.endsWith("\\bundles")){
        //     deleteFolderContent(name, "Deleting bundles:")
        // }

        if(name.indexOf("/brick-storage/") > 0 || name.indexOf("\\brick-storage\\") > 0 ){
            deleteFolderContent(name, "Deleting bricks:")
        }
    }
    return undefined;
}

walk(myPath, filterFiles, filterFolders, function(err, result){
    result.map( name => {
        console.log("Deleting folder:", name);
        fs.unlinkSync(name);
    })

});

