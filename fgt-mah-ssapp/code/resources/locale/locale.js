/**
 * @module fgt-mah-ssapp.LOCALE
 */

/**
 * defines the localizes strings for the whole ssapp
 */
const LOCALE = {
    en_US: {
        home: {
            title: "Pharmaledger's Finished Good Traceability Application for Marketing Authorization Holders"
        },
        registration: {
            title: "Please register as a Marketing Authorization Holder",
            name: {
                label: "Registered MAH's name:",
                placeholder: 'Please enter your name here...',
                value: 'PDM the Manufacturer',
                required: true
            },
            id: {
                label: 'Registered Id:',
                placeholder: 'Please enter your id here...',
                value: '#ThIsIsApArTnErId=',
                required: true
            },
            email: {
                label: 'Registered Email:',
                placeholder: 'Please enter your email here...',
                value: 'mah@pdmfc.com',
                required: true
            },
            nif: {
                label: 'Registered fiscal number:',
                placeholder: "Enter your fiscal number...",
                value: 500000000,
                required: true
            },
            address: {
                label: 'Registered Address:',
                placeholder: "Enter your address...",
                required: true,
                value: "This in an Address"
            },
            register: "Register"
        },
        dashboard:{
            title: "This is a Dashboard"
        },
        product: {
            title: "Fill new Product Details:",
            add: "Add Product",
            name: {
                label: "Product name:",
                placeholder: 'Please enter the product name here...',
                value: 'PDM product',
                required: true
            },
            gtin: {
                label: "Product gtin:",
                placeholder: 'Please enter your name here...',
                value: '05290931025615',
                required: true
            },
            description: {
                label: "Product description:",
                placeholder: 'Please enter the product description here...',
                value: 'This product is very good for you'
            },
            mah: {
                label: "Marketing Authorization Holder:"
            }
        },
        batch: {
            title: "Fill in new Batch Details:",
            add: "Add Batch",
            batchNumber: {
                label: "Batch Number:",
                placeholder: 'Please enter the batch number here...',
                required: true
            },
            gtin: {
                label: "Product gtin:",
                required: true
            },
            expiry: {
                label: "Product description:",
                placeholder: 'Please enter the product description here...',
                value: 'This product is very good for you'
            },
            serialNumbers: {
                label: "Enter Serial Numbers here:",
                placeholder: '(comma separated or ranges)'
            }
        },
        products: {
            title: "Product Manager",
            nameHeader: "Name",
            gtinHeader: "Gtin",
            batchesHeader: "Manage Batches",
            add: "Add Product"
        },
        batches: {
            title: "Batch Manager"
        }
    }
}