const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {MAH_API} = require("../controls/utils");


describe('productApi', function () {
    const product = db.products[0];

    describe('POST /product/create', function () {

        it ('should create a new product', (done) => {
            chai.request(MAH_API)
                .post('/product/create')
                .send(product)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('gtin').equal(product.gtin);
                    res.body.should.have.property('name').equal(product.name);
                    res.body.should.have.property('description').equal(product.description);
                    res.body.should.have.property('manufName').equal(db.mahParticipant);
                    res.body.should.have.property('keySSI');
                    done();
                });
        });

        it ('should return a error when product already exists', (done) => {
            chai.request(MAH_API)
                .post('/product/create')
                .send(product)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').equal(`Could not create product DSU of GTIN ${product.gtin} because it already exists.`);
                    done();
                });
        });
    });

    describe('GET /product/get', function () {

        it ('should get product by GTIN', (done) => {
            chai.request(MAH_API)
                .get(`/product/get/${product.gtin}`)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('gtin').equal(product.gtin);
                    res.body.should.have.property('name').equal(product.name);
                    res.body.should.have.property('description').equal(product.description);
                    res.body.should.have.property('manufName').equal(db.mahParticipant);
                    done();
                });
        });

        it ('should get all products', (done) => {
            chai.request(MAH_API)
                .get('/product/getAll')
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