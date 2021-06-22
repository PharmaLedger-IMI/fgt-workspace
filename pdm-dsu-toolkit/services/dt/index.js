/**
 * Provides a Environment Independent and Versatile Dossier Building API.
 *
 * Meant to be integrated into OpenDSU.
 *
 * The need to produce DSUs with complicated relations between them as well as the addition of the database API to the
 * Open DSU framework, which, on its first run, creates a complicated DSU structure (which can sometimes take a long time
 * from a UI/UX perspective) led initially to long waits on webapps, often with frozen UI due to the intense processing happening.
 *
 * This created the need for a more powerful, more configurable building process,
 * that could adapt to the individual needs of each SSApp
 *
 * For that reason this module was refactored, exposing most of the OpenDSU Archive API via simple text commands,
 * that can be hardcoded into any SSApp and serve as its individual build script upon the creation of a new instance.
 *
 * This concentrates all the heavy processing in a single execution, at a time where the UI is perfectly manageable,
 * and without any further inconveniences to the end user.
 *
 * The build process rests on the concept of a source object, typically a source DSU, on which the commands will operate on.
 *
 * for instance, the simple (original) build script for most SSApps in the PharmaLedger Ecosystem is:
 * <pre>
 *     delete /
 *     addfolder code
 *     mount ../cardinal/seed /cardinal
 *     mount ../themes/#/seed /themes/#
 * </pre>
 * (the cardinal represents an '*')
 *
 * This simple build simples has with it, implicitly a sourceDSU that is the DSU just created using the credentials from the loader.
 *
 * Explicitly the script would be:
 * <pre>
 *     with createdsu wallet domain stringified_keygenargs
 *          delete /
 *          addfolder code
 *          mount ../cardinal/seed /cardinal
 *          mount ../themes/#/seed /themes/#
 *     endwith
 * </pre>
 *
 * in the with command it becomes apparent how to use the with command and the source DSU/Object.
 *
 * This notion is imperative for more complex scripts like this:
 *
 * <pre>
 *     define $ID$ -$Identity-
 *     define $ENV$ -$Environment-
 *
 *     with createdsu seed traceability specificstring
 *          define $SEED$ getidentifier
 *          createfile info $ID$
 *     endwith
 *
 *     createfile environment.json $ENV$
 *     mount $SEED$ /id
 *
 *     with $SEED$
 *          define $READ$ derive
 *     endwith
 *
 *     define $SECRETS$ objtoarray $ID$
 *
 *     with createdsu const traceability $SECRETS$
 *          mount $READ$ /id
 *          define $CONST$ getidentifier
 *     endwith
 *
 *     mount $CONST$ /participant
 *
 *     with createdsu seed traceability innerdb
 *          define $INNER$ getidentifier
 *     endwith
 *
 *     with createdsu seed traceability fordb
 *          mount $INNER$ /data
 *          define $DB$ getidentifier
 *     endwith
 *     mount $DB$ /db
 * </pre>
 *
 * Notice the existence of 2 specific placeholders:
 *  - -$Identity- : this placeholder will be replaced by the public parts the the loader credentials
 *  - -$Environment- : this placeholder will be replaced the the environment file contents from the loader
 *
 * Also notice how by using the with command we change the source object to be able to perform actions of them
 * and/or extract relevant information and store it in variables for later use.
 *
 * To be able to achieve this level of control a Command Design Pattern was implemented providing access to the most common
 * OpenDSU APIs:
 *  - addFile: {@link AddFileCommand} - from OpenDSU's Archive API
 *  - addFolder: {@link AddFolderCommand} - from OpenDSU's Archive API
 *  - createDSU: {@link CreateDSUCommand} - from OpenDSU's Resolver API
 *  - createFile: {@link CreateFileCommand} - from OpenDSU's Archive API
 *  - define: {@link DefineCommand} - functional Command
 *  - delete: {@link DeleteCommand} - from OpenDSU's Archive API
 *  - derive: {@link DeriveCommand} - from OpenDSU's KeySSI API
 *  - endWith: {@link EndWithCommand} - functional Command
 *  - genDB: {@link GenDBCommand} - functional Command
 *  - genKey: {@link GenKeyCommand} - from OpenDSU's KeySSI API
 *  - getIdentifier: {@link GetIdentifierCommand} - from OpenDSU's Archive|KeySSI API
 *  - mount: {@link MountCommand} - from OpenDSU's Archive API
 *  - objToArray: {@link ObjToArrayCommand} - functional Command
 *  - readFile: {@link ReadFileCommand} - from OpenDSU's Archive API
 *  - with: {@link WithCommand} - functional Command
 * @namespace dt
 * @memberOf Services
 */

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU] should only be provided when cloning a DSU
 * @return {DossierBuilder}
 * @memberOf dt
 */
const getDossierBuilder = (sourceDSU, ) => {
    return new (require("./DossierBuilder"))(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Commands: require('./commands'),
    AppBuilderService: require('./AppBuilderService')
}
