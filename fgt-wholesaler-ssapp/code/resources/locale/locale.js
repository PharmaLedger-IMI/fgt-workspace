/**
 * @module fgt-mah-ssapp.LOCALE
 */

/**
 * defines the localizes strings for the whole ssapp
 */
const LOCALE = {
    en_US: {
        home: {
            title: "PharmaLedger's Finished Good Traceability Application for Wholesalers"
        },
        registration: {
            title: "Please register as a Wholesaler",
            name: {
                label: "Registered Wholesaler's name:",
                placeholder: 'Please enter your name here...',
                value: 'PDM the Wholesaler',
                required: true
            },
            id: {
                label: 'Registered Id:',
                placeholder: 'Please enter your id here...',
                value: '#ThIsIsAwHoLeSaLeRiD=',
                required: true
            },
            email: {
                label: 'Registered Email:',
                placeholder: 'Please enter your email here...',
                value: 'wholesaler@pdmfc.com',
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
            title: "This is a Dashboard",
            none: "There are no pending orders"
        },
        processorders: {
            title: "Pending Orders",
            requesterIdHeader: "Requester Id",
            orderIdHeader: "Order Id",
            orderLinesHeader: "Order lines",
            actionsHeader: "Actions",
            gtinHeader: "Gtin",
            nameHeader: "Name",
            quantityHeader: "Quantity",
            none: "No pending orders..."
        },
        shipment: {
            title: "Fill new Shipment Details:",
            add: "Add Shipment",
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
        shipments: {
            title: "Shipment Manager",
            shipmentIdHeader: "Shipment Id",
            productsHeader: "Products",
            shipmentStatusHeader: "Status"
        },
        stock: {
            title: "Stock Manager",
            gtinHeader: "Gtin",
            nameHeader: "Name",
            batchesHeader: "Batches",
            quantityHeader: "Quantity",
            none: "No products in stock..."
        }
    }
}