const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {BASE_PATH} = require("../controls/utils");


describe('stockApi', function () {
    require('./batchApi.test');
    const product = db.products[0];
    const batch = db.batches[0];

    describe('GET /stock/get', function () {

        it ('should get stock by GTIN', (done) => {
            chai.request(BASE_PATH)
                .get(`/stock/get/${batch.gtin}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('gtin').equal(batch.gtin);
                    res.body.should.have.property('name').equal(product.name);
                    res.body.should.have.property('description').equal(product.description);
                    res.body.should.have.property('manufName').equal(db.mahParticipant);
                    res.body.should.have.property('batches');
                    res.body.should.have.property('batches').to.be.a('array');
                    done();
                });
        });

        it ('should get all stock', (done) => {
            chai.request(BASE_PATH)
                .get('/stock/getAll')
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