/**
 * @module fgt-pharmacy-ssapp.LOCALE
 */

/**
 * defines the localizes strings for the whole ssapp
 */
const LOCALE = {
    en_US: {
        home: {
            title: "PharmaLedger's Finished Good Traceability Application for Pharmacies"
        },
        registration: {
            title: "Please register as a Pharmacy",
            name: {
                label: "Registered Pharmarcy's name:",
                placeholder: 'Please enter your name here...',
                value: 'PDM the Pharmacy',
                required: true
            },
            id: {
                label: 'Registered Id:',
                placeholder: 'Please enter your id here...',
                value: '#PharmacyID31',
                required: true
            },
            email: {
                label: 'Registered Email:',
                placeholder: 'Please enter your email here...',
                value: 'pharmacy@pdmfc.com',
                required: true
            },
            tin: {
                label: 'Registered TIN (Tax Identification Number):',
                placeholder: "Enter your TIN (Tax Identifier Number)...",
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
        issuedOrder: {
            title: "Fill new Order Details:",
            add: "Submit Order",
            orderId: {
                label: "Order Number:",
                placeholder: 'Please enter the Order Number here...',
                value: '123',
                required: true
            },
            requesterId: {
                label: "Ordering partner ID:",
                placeholder: 'Please enter the ordering partner ID here...',
                value: 'TPHH2437',
                required: true
            },
            senderId: {
                label: "Supplying partner ID:",
                placeholder: 'Please enter the supplying partner ID here...',
                value: 'WHS3572',
                required: true
            },
            shipToAddress: {
                label: "Ship-to Address:",
                placeholder: 'Please enter an address here...',
                value: 'Street of TPHH2437, door 1, floor 2',
                required: true
            },
            orderLines: {
                label: "OrderLines:",
                placeholder: 'gtin1,quant1;gtin2,quant2;gtin3,quant3',
                value: '',
                required: true
            },
        },
        issuedOrders: {
            title: "Issued Order Manager",
            add: "Create Order",
            numberHeader: "OrderID",
            orderingPartnerHeader: "Requester",
            supplyingPartnerHeader: "Supplier",
            none: "No orders..."
        },
       dashboard:{
            title: "This is a Dashboard"
        },
   }
}