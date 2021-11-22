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

function toPage(currentPage, totalPages, items, itemsPerPage){
    return new Page({
        itemsPerPage: itemsPerPage,
        currentPage: currentPage,
        totalPages: totalPages,
        items: items || []
    });
}

function paginate(items, itemsPerPage, page){
    const totalPages = Math.floor(items.length / itemsPerPage) + (items.length % itemsPerPage === 0 ? 0 : 1);
        let startIndex = (page - 1) * itemsPerPage;
        startIndex = startIndex === 0 ? startIndex : startIndex - 1;
        const endIndex = startIndex + itemsPerPage >= items.length ? undefined: startIndex + itemsPerPage;
        const sliced = items.slice(startIndex, endIndex);
        return toPage(page, totalPages, sliced);
}
module.exports = {
    Page,
    toPage,
    paginate
}
