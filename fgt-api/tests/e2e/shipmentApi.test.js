const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {MAH_API} = require("../controls/utils");


describe('shipmentApi', function () {
    require("./batchApi.test");
    const shipment = db.shipments[0];

    describe('POST /shipment/create', function () {
        it('should create a shipment', (done) => {
            chai.request(MAH_API)
                .post('/shipment/create')
                .send(shipment)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property("orderId").equal(shipment.orderId);
                    res.body.should.have.property("requesterId").equal(shipment.requesterId);
                    res.body.should.have.property("senderId").equal(shipment.senderId);
                    res.body.should.have.property("status").should.be.a("object");
                    res.body.status.should.have.property('status').equal("created");
                    res.body.should.have.property("shipmentLines");
                    res.body.shipmentLines.should.be.a("array");
                    res.body.shipmentLines.length.should.be.equal(shipment.shipmentLines.length);
                    res.body.should.have.property('keySSI');
                    done();
                });
        });

        it('should return a error when shipmentId already exists', (done) => {
            chai.request(MAH_API)
                .post('/shipment/create')
                .send(shipment)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(400);
                    res.body.should.have.property("status").equal(400);
                    res.body.should.have.property("error").equal("Bad Request");
                    res.body.should.have.property("message").equal(`Could not insert record with shipmentId ${shipment.shipmentId} on table simpleShipments. Trying to insert a existing record.`);
                    done();
                });
        });
    });

    describe('PUT /shipment/update', function () {

        it('should update shipment status to pickup', (done) => {
            chai.request(MAH_API)
                .put(`/shipment/update/${shipment.shipmentId}`)
                .send({
                    status: "pickup",
                    extraInfo: "update status to pickup"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property("shipmentId");
                    res.body.should.have.property("orderId").equal(shipment.orderId);
                    res.body.should.have.property("requesterId").equal(shipment.requesterId);
                    res.body.should.have.property("senderId").equal(shipment.senderId);
                    res.body.should.have.property("status").should.be.a("object");
                    res.body.status.should.have.property("status").equal("pickup");
                    res.body.status.should.have.property("log");
                    res.body.status.log.should.be.a("array");
                    res.body.status.should.have.property("extraInfo");
                    res.body.status.extraInfo.should.be.a("object");
                    res.body.status.extraInfo.should.have.property("pickup");
                    res.body.should.have.property('shipmentLines');
                    res.body.shipmentLines.should.be.a('array');
                    res.body.shipmentLines.length.should.be.equal(shipment.shipmentLines.length);
                    done();
                });
        });

        it("shouldn't update shipment status when is not allowed", (done) => {
            chai.request(MAH_API)
                .put(`/shipment/update/${shipment.shipmentId}`)
                .send({status: "delivered"})
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(400);
                    res.body.should.have.property('status').equal(400);
                    res.body.should.have.property('error').equal('Bad Request');
                    res.body.should.have.property('message').equal(`Status update from pickup to delivered is not allowed`);
                    done();
                });
        });

    });

    describe('GET /shipment/get', function () {

        it('should get shipment by shipmentId', (done) => {
            chai.request(MAH_API)
                .get(`/shipment/get/${shipment.shipmentId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property("shipmentId");
                    res.body.should.have.property("orderId").equal(shipment.orderId);
                    res.body.should.have.property("requesterId").equal(shipment.requesterId);
                    res.body.should.have.property("senderId").equal(shipment.senderId);
                    res.body.should.have.property("status").should.be.a("object");
                    res.body.status.should.have.property("status").equal("pickup");
                    res.body.status.should.have.property("log");
                    res.body.status.log.should.be.a("array");
                    res.body.status.should.have.property("extraInfo");
                    res.body.status.extraInfo.should.be.a("object");
                    res.body.status.extraInfo.should.have.property("pickup");
                    res.body.should.have.property('shipmentLines');
                    res.body.shipmentLines.should.be.a('array');
                    res.body.shipmentLines.length.should.be.equal(shipment.shipmentLines.length);
                    done();
                });
        });

        it('should get all shipments', (done) => {
            chai.request(MAH_API)
                .get('/shipment/getAll')
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('meta');
                    res.body.should.have.property('results');
                    res.body.results.should.be.a('array');
                    res.body.results.length.should.be.greaterThan(0);
                    done();
                });
        });
    });

});