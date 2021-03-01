const LOCALE = {
    en_US: {
        home: {
            title: "Pharmaledger's Finished Good Traceability Application for Marketing Authorization Holders"
        },
        registration: {
            title: "Please register as a Marketing Authorization Holder",
            fullName: {
                label: "Registered MAH's name:",
                placeholder: 'Please enter your name here...',
                value: 'PDM sells drugs',
                required: true
            },
            email: {
                label: 'Registered Email:',
                placeholder: 'Please enter your email here...',
                value: 'drug_sellers@pdmfc.com',
                required: true
            },
            nif: {
                label: 'Registered fiscal number:',
                placeholder: "Enter your fiscal number...",
                value: 500000000,
                required: true
            },
            password: {
                label: 'Password:',
                required: true
            },
            password2: {
                label: 'Please repeat your password:',
                required: true
            },
            register: "Register"
        }
    }
}

module.exports = LOCALE;