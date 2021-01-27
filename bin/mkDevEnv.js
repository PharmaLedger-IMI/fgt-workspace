let fileArgDevel = "env.json.devel";
let fs = require("fs");
fs.writeFile(fileArgDevel, "This file indicates that octopus is using octopus.json and not octopus-dev.json file to install dependencies", function(err){
if(err){
	console.error(err);
   }
});
