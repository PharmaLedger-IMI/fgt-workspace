import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import constants from "../constants.js";
import SharedStorage from '../services/SharedDBStorageService.js';
import Utils from "../models/Utils.js";
import utils from "../utils.js";
import LogService from "../services/LogService.js";
import Product from "../models/Product.js";

export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({});
        this.storageService = new SharedStorage(this.DSUStorage);
        this.logService = new LogService(this.DSUStorage);

        this.model.addExpression('productsListLoaded', () => {
            return typeof this.model.productsForDisplay !== "undefined";
        }, 'productsForDisplay');


        this.storageService.getObject(constants.PRODUCTS_TABLE, (err, products) => {
            this.products = products;
            this.model.productsForDisplay = Object.values(products).map(productVersions => productVersions[productVersions.length - 1]);
        });

        this.on("add-product", (event) => {
            event.stopImmediatePropagation();
            this.History.navigateToPageByTag("manage-product");
        });

        this.on("transfer", (event) => {
            const gtin = event.target.getAttribute("gtin");
            this.products[gtin][this.products[gtin].length - 1].transferred = true;

            const product = this.products[gtin][this.products[gtin].length - 1];
            let actionModalModel = {
                title: "Enter the company name to which the product is transferred",
                transferCode: $$.Buffer.from(JSON.stringify(product)).toString("base64"),
                acceptButtonText: 'Accept',
                denyButtonText: 'Cancel'
            }
            this.showModal('transferProductModal', actionModalModel, (err, response) => {
                if (err || response === undefined) {
                    return;
                }
                product.transferred = true;
                product.manufName = response;
                this.logService.log({
                    logInfo: product,
                    username: this.model.username,
                    action: `Transferred product to ${response}`,
                    logType: 'PRODUCT_LOG'
                }, (err) => {
                    if (err) {
                        return console.log(err);
                    }

                    this.storageService.setObject(constants.PRODUCTS_TABLE, this.products, ()=>{
                        this.model.productsForDisplay = Object.values(this.products).map(productVersions => productVersions[productVersions.length - 1]);
                    });
                });
            });
        });

        this.on("get-transferred-product", (event) => {
            let actionModalModel = {
                title: "Add transferred product",
                acceptButtonText: 'Accept',
                denyButtonText: 'Cancel'
            }
            this.showModal('getTransferredProductModal', actionModalModel, (err, response) => {
                if (err || response === undefined) {
                    return;
                }

                const product = JSON.parse($$.Buffer.from(response, "base64").toString());
                this.addProductToProductsList(new Product(product), (err)=>{
                    if (err) {
                        return console.log(err);
                    }
                    this.model.productsForDisplay = Object.values(this.products).map(productVersions => productVersions[productVersions.length - 1]);
                });
            });
        });

        this.on('edit-product', (event) => {
            const gtin = event.target.getAttribute("gtin");
            this.History.navigateToPageByTag("manage-product", {gtin: gtin});
        }, {capture: true});


        this.on("view-drug", (event) => {
            this.History.navigateToPageByTag("drug-details");
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });
    }

    addProductToProductsList(product, callback) {
        if (typeof this.products[product.gtin] !== "undefined" && this.products[product.gtin].length) {
            return callback(undefined, undefined);
        }
        this.logService.log({
            logInfo: product,
            username: this.model.username,
            action: `Transferred product from ${product.manufName}`,
            logType: 'PRODUCT_LOG'
        }, (err) => {
            if (err) {
                return callback(err);
            }

            product.transferred = false;
            this.products[product.gtin] = [product];
            this.storageService.setObject(constants.PRODUCTS_TABLE, this.products, callback);
        });
    }
}