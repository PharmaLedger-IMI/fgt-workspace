/**
 * @module fgt-pharmacy-ssapp.LOCALE
 */

/**
 * defines the localizes strings for the whole ssapp
 */
const LOCALE = {
    en_US: {
        home: {
            title: "Pharmaledger's Finished Good Traceability Application for Pharmacies"
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
                value: '#ThIsIsAPharmacyId=',
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
                placeholder: "Enter your TIN (Tax Idendifier Number)...",
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
        orders: {
            title: "Order Manager",
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