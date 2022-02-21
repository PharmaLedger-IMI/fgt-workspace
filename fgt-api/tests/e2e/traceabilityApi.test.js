const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const {db} = require("../controls/db/db");
const {MAH_API} = require("../controls/utils");


describe('traceabilityApi', function () {
    require('./saleApi.test');

    describe('POST /traceability/create', function () {
        const sale = db.sales[0].productList[0];

        it ('should get traceability by GTIN and batchNumber', (done) => {
            chai.request(MAH_API)
                .post(`/traceability/create`)
                .send({
                    gtin: sale.gtin,
                    batchNumber: sale.batchNumber
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('id');
                    res.body.should.have.property('title');
                    res.body.should.have.property('parents');
                    res.body.should.have.property('children');
                    done();
                });
        });

        it ('should get traceability by GTIN, batchNumber and serialNumber', (done) => {
            chai.request(MAH_API)
                .post(`/traceability/create`)
                .send({
                    gtin: sale.gtin,
                    batchNumber: sale.batchNumber,
                    serialNumber: sale.serialNumber
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('id');
                    res.body.should.have.property('title');
                    res.body.should.have.property('parents');
                    res.body.should.have.property('children');
                    done();
                });
        });

        it ('should get all traceability', (done) => {
            chai.request(MAH_API)
                .post('/traceability/createAll')
                .send([{
                    gtin: sale.gtin,
                    batchNumber: sale.batchNumber
                }])
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.greaterThan(0);
                    done();
                });
        });
    });

});