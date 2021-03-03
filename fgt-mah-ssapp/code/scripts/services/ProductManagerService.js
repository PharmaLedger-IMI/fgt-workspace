const MOUNT_PATH = "/products";

/**
 * Helper Class to handle product creation and its mount on the MAH ssapp
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 */
class ProductManagerService {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.productService = require('wizard').Services.ProductService;
    }

    /**
     *
     * @param product
     * @param callback
     */
    createProduct(product, callback) {

    }

    getProduct(gtin, callback){

    }

    removeProduct(gtin, callback) {

    }

    editProduct(product, callback) {

    }

    listProducts(callback) {

    }
}

let productManagerService;
const getInstance = function (dsuStorage) {
    if (!productManagerService)
        productManagerService = new ProductManagerService(dsuStorage);
    return productManagerService;
}

export {
    getInstance
};