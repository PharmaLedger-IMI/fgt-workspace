/**
 * Constants
 * @namespace Constants
 */

/**
 * default info writing path in DSU's since you can't write to '/'
 * @memberOf Constants
 */
const INFO_PATH = '/info';

/**
 * Default mount path for the participant const under the PDM SSApp Architecture
 * @memberOf Constants
 */
const PARTICIPANT_MOUNT_PATH = "/participant";

/**
 * Default mount path for the Id DSU under the PDM SSApp Architecture
 * @memberOf Constants
 */
const IDENTITY_MOUNT_PATH = '/id'

const DATABASE_MOUNT_PATH = '/db'

const DID_METHOD = 'demo'

const MESSAGE_REFRESH_RATE = 1000;
const MESSAGE_TABLE = 'messages'

/**
 * Default Query options to be used by the managers to query the database
 * @type {{query: string[]|undefined, limit: number|undefined, sort: string|undefined}}
 * @memberOf Constants
 */
const DEFAULT_QUERY_OPTIONS = {
    query: ["__timestamp > 0"],
    sort: "dsc",
    limit: undefined
}

const INPUT_FIELD_PREFIX = 'input-'

module.exports = {
    INFO_PATH,
    PARTICIPANT_MOUNT_PATH,
    IDENTITY_MOUNT_PATH,
    DATABASE_MOUNT_PATH,
    DID_METHOD,
    MESSAGE_REFRESH_RATE,
    MESSAGE_TABLE,
    DEFAULT_QUERY_OPTIONS,
    INPUT_FIELD_PREFIX
}