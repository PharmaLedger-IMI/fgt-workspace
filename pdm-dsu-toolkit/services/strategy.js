/**
 * DSU creation strategies:
 *  - **Simple:** Users the direct OpenDSU API. Only works if the APIHub is not in authorized mode;
 *  - **Authorized:** Uses the DSUFabric and {@link DSUBuilder} to ensure transactions and permissions
 * @module services
 */
const STRATEGY = {
    AUTHORIZED: "authorized",
    SIMPLE: "simple"
}

module.exports = STRATEGY;