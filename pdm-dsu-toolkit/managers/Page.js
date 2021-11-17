/**
 * Util class to handle pagination
 * @class Page
 * @memberOf Managers
 */
 class Page {
    itemsPerPage = 10;
    currentPage = 1;
    totalPages = undefined;
    items = [];

    constructor(page) {
        if (typeof page !== undefined)
            for (let prop in page)
                if (page.hasOwnProperty(prop))
                    this[prop] = page[prop];
    }
}

module.exports = Page;
