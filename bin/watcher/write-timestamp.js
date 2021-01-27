/**
 * Basic script which writes a timestamp in file
 * This is executed by the "watch" script(s) after a change
 * has been detected in the file system.
 *
 * If the "web-dossier-loader" application is running in "development"
 * mode it will fetch the timestamp file, compare the timestamp with
 * the one stored in local storage and if the timestamp is newer
 * it will rebuild the wallet
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve([__dirname, '..', '..'].join(path.sep));

const argv = Object.assign([], process.argv);
argv.shift();
argv.shift();

let baseDir;

for (let i = 0; i < argv.length; i++) {
    if (argv[i] !== '--dir') {
        continue;
    }

    baseDir = argv[i + 1];
    break;
}

if (!baseDir) {
    console.log('Usage: write-timestamp.js --dir=directory,relative,to,apihub-root');
    process.exit(1);
}

const lastUpdateFile = [rootDir, 'apihub-root', baseDir, 'last-update.txt'].join(path.sep);

fs.writeFileSync(lastUpdateFile, Date.now().toString());
