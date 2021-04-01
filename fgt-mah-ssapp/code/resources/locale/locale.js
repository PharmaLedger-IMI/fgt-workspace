/**
 * @module fgt-mah-ssapp.LOCALE
 */

/**
 * defines the localizes strings for the whole ssapp
 */
const LOCALE = {
    en_US: {
        home: {
            title: "PharmaLedger's Finished Good Traceability Application for Marketing Authorization Holders"
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
                value: '#MAHID12',
                required: true
            },
            email: {
                label: 'Registered Email:',
                placeholder: 'Please enter your email here...',
                value: 'mah@pdmfc.com',
                required: true
            },
            tin: {
                label: 'Registered TIN (Tax Identification Number):',
                placeholder: "Enter your TIN (Tax Identification Number)...",
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
            manufName: {
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
            add: "Add Product",
            none: "No registered products..."
        },
        batches: {
            title: "Batch Manager",
            add: "Add Batch",
            none: "No Batches",
            batchNumberHeader: "Batch Number",
            expiryHeader: "Expiration Date",
            serialNumbersHeader: "Serial Numbers"
        }
    }
}