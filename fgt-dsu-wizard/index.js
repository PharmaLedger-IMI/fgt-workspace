function ORDER_DSU_WIZARD(server){
	const setOrderSSI = require("./commands/setOrderSSI");
	setOrderSSI(server);
}

function ORDERLINE_DSU_WIZARD(server){
	const setOrderLineSSI = require("./commands/setOrderLineSSI");
	setOrderLineSSI(server);
}

function SHIPMENT_DSU_WIZARD(server){
	const setOrderSSI = require("./commands/setShipmentSSI");
	setOrderSSI(server);
}

function SHIPMENTLINE_DSU_WIZARD(server){
	const setOrderLineSSI = require("./commands/setShipmentLineSSI");
	setOrderLineSSI(server);
}

module.exports = {
	ORDER_DSU_WIZARD,
	ORDERLINE_DSU_WIZARD,
	SHIPMENT_DSU_WIZARD,
	SHIPMENTLINE_DSU_WIZARD,
	DSUService: new (require('./services/DSUService'))
};
