/**
 * Constants
 * @module constants
 */

/**
 * default info writing path in DSU's since you can't write to '/'
 */
const INFO_PATH = '/info';

/**
 * Default mount path for the participant const under the PDM SSApp Architecture
 */
const PARTICIPANT_MOUNT_PATH = "/participant";

/**
 * Default mount path for the Id DSU under the PDM SSApp Architecture
 */
const IDENTITY_MOUNT_PATH = '/id'

const DATABASE_MOUNT_PATH = '/db'

const DID_METHOD = 'demo'

const MESSAGE_REFRESH_RATE = 1000;
const MESSAGE_TABLE = 'messages'

module.exports = {
    INFO_PATH,
    PARTICIPANT_MOUNT_PATH,
    IDENTITY_MOUNT_PATH,
    DATABASE_MOUNT_PATH,
    DID_METHOD,
    MESSAGE_REFRESH_RATE,
    MESSAGE_TABLE
}