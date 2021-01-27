/**
 * Wrapper script for `privatesky/bin/scripts/watcher.js`.
 */
const path = require('path');
const childProcess = require('child_process');

const rootDir = path.resolve([__dirname, '..', '..'].join(path.sep));
const watcherScriptPath = [rootDir, 'privatesky', 'bin', 'scripts', 'watcher.js'].join(path.sep);
const writeTimestampScriptPath = [rootDir, 'bin', 'watcher', 'write-timestamp.js'].join(path.sep);

const appTemplatesToWatch = [];
const childProcessesPIds = [];

const config = {
    app: '',
    serverDocRoot: 'secure-channels'
};

const argv = Object.assign([], process.argv);
argv.shift();
argv.shift();

for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) {
        throw new Error(`Invalid argument ${argv[i]}`);
    }

    const argument = argv[i].substr(2);
    const separatorIndex = argument.indexOf('=');

    let argumentKey;
    let argumentValue;

    if (separatorIndex !== -1) {
        argumentKey = argument.substr(0, separatorIndex);
        argumentValue = argument.substr(separatorIndex + 1);
    } else {
        if (argv[i + 1] && argv[i + 1].startsWith('--')) {
            throw new Error(`Missing value for argument ${argument}`);
        }

        argumentKey = argument;
        argumentValue = argv[i + 1];
    }

    argumentValue = preprocessArgument(argumentValue);
    editConfig(argumentKey, argumentValue);
}

if (!config.app) {
    showUsage();
    process.exit(0);
}


if (config.app) {
    // Watch for changes in the top-level wallets/ssapp(s)
    // and trigger wallet/ssapp rebuild
    config.app = !Array.isArray(config.app) ? [config.app] : config.app;
    const watchedApps = config.app.filter(path => path.length)
        .map((dir) => {
            return path.resolve(`${rootDir}${path.sep}${dir}`);
        });

    for (const appPath of watchedApps) {
        watchApplication(appPath);
    }

    // Watch for changes in the template files
    const proc = childProcess.fork(watcherScriptPath, [
        '--watch', appTemplatesToWatch.join(','),
        '--run', writeTimestampScriptPath,
        '--args', `--dir ${config.serverDocRoot}`,
        '--allowedFileExtensions=.js,.html,.css,.json'
    ])
    childProcessesPIds.push(proc.pid);
    proc.on('error', (error) => {
        console.error(error);
    })

    // Make sure we kill any spawned children before exiting
    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
}

/* ------------ Utils functions ------------ */

function watchApplication(appPath) {
    const appName = appPath.split(path.sep).pop();

    addAppTemplateToWatchList(appName);

    // Watch the application directory for changes
    const proc = childProcess.fork(watcherScriptPath, ['--watch', appPath,
        '--exec', `npm run build ${appName}`,
        '--workingDirectory', rootDir,
        '--allowedFileExtensions=.js,.html,.css,.json',
        '--ignore', '/code/constitution,/code/scripts/bundles,/build/tmp,/builds/tmp'], {
            stdio: 'pipe'
    });
    childProcessesPIds.push(proc.pid);

    proc.on('error', (error) => {
        console.error(error);
    });

    proc.stdout.on('data', (data) => {
        const output = data.toString();

        // After finishing a build, write the 'last-update.txt' file
        // so that the loader knows to clear the service workers cache
        if (output.indexOf('finish.') !== -1) {
            const proc = childProcess.fork(writeTimestampScriptPath, [
                '--dir', config.serverDocRoot
            ]);
            proc.on('error', (err) => {
                console.error(err);
            })
        }
        console.log(output);
    });
}

function addAppTemplateToWatchList(appName) {
    let appTemplatePrefix = appName;

    if (appName.toLowerCase().indexOf('wallet') !== -1) {
        appTemplatePrefix = 'wallet';
    }
    const appTemplateDir = `${appTemplatePrefix}-template`;

    appTemplatesToWatch.push(path.resolve([
        rootDir,
        'apihub-root',
        config.serverDocRoot,
        appTemplateDir
    ].join(path.sep)));
}

function editConfig(key, value) {
    if (!config.hasOwnProperty(key)) {
        throw new Error(`Invalid argument ${key}`);
    }

    config[key] = value;

    if (Array.isArray(config.key) && !Array.isArray(value)) {
        config[key] = [value];
    }
}

function preprocessArgument(argument) {
    argument = argument || '';
    let value = argument.split(',');

    if (value.length === 1) {
        value = value[0];
    } else {
        value = value.map(element => element.trim());
    }

    return value;
}

function exitHandler(signal) {
    console.log(`Caught exit signal: ${signal}`);
    for (const pid of childProcessesPIds) {
        console.log(`Stopping ${pid}`);
        process.kill(pid);
    }
    process.exit(signal);
}

function showUsage() {
    console.log(`Usage: watcher.js --app=list,of,apps [--serverDocRoot=secure-channels]

    watcher.js --app=profile-app,menu-wallet [--serverDocRoot=secure-channels]

If running the script using "npm run watch" pass the arguments after the "--" separator:

    npm run watch -- --app=profile-app,menu-wallet [--serverDocRoot=secure-channels]
`);

}
