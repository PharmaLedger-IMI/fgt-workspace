const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {MAH_API} = require("../controls/utils");


describe('batchApi', function () {
    require("./productApi.test");
    const batch = db.batches[0];

    describe('POST /batch/create', function () {

        it ('should create batches', (done) => {
            const batches = db.batches;
            chai.request(MAH_API)
                .post('/batch/createAll')
                .send(batches)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body[0].should.have.property('batchNumber').equal(batches[0].batchNumber);
                    res.body[0].should.have.property('expiry').equal(new Date(batches[0].expiry).toISOString());
                    res.body[0].should.have.property('serialNumbers');
                    res.body[0].serialNumbers.should.be.a('array');
                    res.body[0].should.have.property('quantity').equal(batches[0].serialNumbers.length);
                    res.body[0].should.have.property('batchStatus').should.be.a('object');
                    res.body[0].batchStatus.should.have.property('status').equal('commissioned');
                    res.body[0].batchStatus.should.have.property('log');
                    res.body[0].batchStatus.log.should.be.a('array');
                    res.body[0].should.have.property('keySSI');

                    res.body[1].should.have.property('batchNumber').equal(batches[1].batchNumber);
                    res.body[1].should.have.property('expiry').equal(new Date(batches[1].expiry).toISOString());
                    res.body[1].should.have.property('serialNumbers');
                    res.body[1].serialNumbers.should.be.a('array');
                    res.body[1].should.have.property('quantity').equal(batches[1].serialNumbers.length);
                    res.body[1].should.have.property('batchStatus').should.be.a('object');
                    res.body[1].batchStatus.should.have.property('status').equal('commissioned');
                    res.body[1].batchStatus.should.have.property('log');
                    res.body[1].batchStatus.log.should.be.a('array');
                    res.body[1].should.have.property('keySSI');
                    done();
                });
        });

        it ('should return a error when batch already exists', (done) => {
            chai.request(MAH_API)
                .post('/batch/create')
                .send(batch)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property("message").equal("ConstDSU already exists! Can't be created again.");
                    done();
                });
        });
    });

    describe('PUT /batch/update', function () {

        it ('should update a batch status to recall', (done) => {
            chai.request(MAH_API)
                .put(`/batch/update/${batch.gtin}/${batch.batchNumber}`)
                .send({
                    status: "recall",
                    extraInfo: "update status to recall"
                })
                .end((err, res) => {
                    console.log(`/batch/update/${batch.gtin}/${batch.batchNumber}`)
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('batchNumber').equal(batch.batchNumber);
                    res.body.should.have.property('expiry').equal(new Date(batch.expiry).toISOString());
                    res.body.should.have.property('serialNumbers');
                    res.body.serialNumbers.should.be.a('array');
                    res.body.should.have.property('quantity').equal(batch.serialNumbers.length);
                    res.body.should.have.property('batchStatus').should.be.a('object');
                    res.body.batchStatus.should.have.property('status').equal('recall');
                    res.body.batchStatus.should.have.property('log');
                    res.body.batchStatus.log.should.be.a('array');
                    res.body.batchStatus.should.have.property('extraInfo');
                    res.body.batchStatus.extraInfo.should.be.a('object');
                    res.body.batchStatus.extraInfo.should.have.property('recall');
                    done();
                });
        });

        it ("shouldn't update a batch status when current status is recall", (done) => {
            chai.request(MAH_API)
                .put(`/batch/update/${batch.gtin}/${batch.batchNumber}`)
                .send({status: "quarantined"})
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(400);
                    res.body.should.have.property('status').equal(400);
                    res.body.should.have.property('error').equal('Bad Request');
                    res.body.should.have.property('message').equal(`Status update from recall to quarantined is not allowed`);
                    done();
                });
        });

    });

    describe('GET /batch/get', function () {

        it ('should get batch by GTIN and batchNumber', (done) => {
            chai.request(MAH_API)
                .get(`/batch/get/${batch.gtin}/${batch.batchNumber}`)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('batchNumber').equal(batch.batchNumber);
                    res.body.should.have.property('expiry').equal(new Date(batch.expiry).toISOString());
                    res.body.should.have.property('serialNumbers');
                    res.body.serialNumbers.should.be.a('array');
                    res.body.should.have.property('quantity').equal(batch.serialNumbers.length);
                    res.body.should.have.property('batchStatus').should.be.a('object');
                    res.body.batchStatus.should.have.property('status');
                    res.body.batchStatus.status.should.be.a('string');
                    res.body.batchStatus.should.have.property('log');
                    res.body.batchStatus.log.should.be.a('array');
                    res.body.batchStatus.should.have.property('extraInfo');
                    res.body.batchStatus.extraInfo.should.be.a('object');
                    done();
                });
        });

        it ('should get all batches', (done) => {
            chai.request(MAH_API)
                .get('/batch/getAll')
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