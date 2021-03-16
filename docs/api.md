{
    "managers": [
        "ParticipantManager",
        "MessageManager",
        "DBManager"
    ]
}


walletBuilder.managers.forEAch(m => m.initialize(DSU))


APIs:

MessageManager.send({
    "destination": tradingPartnerId,
    "api": "order"
    "keyssi": keySSI
})


Receiver.MessageManager.received: [
    {
        "api": "order",
        "keyssi": "(...)"
    },
    {
        "api": "shipment",
        "keyssi": "(...)"
    },
]

/
/scripts/controllers
/pages
/db

import db from '../../db/db.js'
db.js
db.budled.js
require(''bundle')


db.bundle.js => require('db')

Manager(DSU(Storage)) => Manager(db)

require(db)

node require(db)