const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {BASE_PATH} = require("../controls/utils");


describe('saleApi', function () {
    require("./batchApi.test");
    const sale = db.sales[0];

    describe('POST /sale/create', function () {

        it('should create a sale', (done) => {
            chai.request(BASE_PATH)
                .post('/sale/create')
                .send(sale)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('id').equal(sale.id);
                    res.body.should.have.property('sellerId').equal(sale.sellerId);
                    res.body.should.have.property('productList');
                    res.body.productList.should.be.a('array');
                    res.body.productList.length.should.be.equal(sale.productList.length);
                    res.body.should.have.property('keySSI');
                    done();
                });
        });

        it('should return a error when try to sale the same product twice', (done) => {
            const productList = [...sale.productList, ...sale.productList];
            const _sale = Object.assign({}, sale, {productList});
            chai.request(BASE_PATH)
                .post('/sale/create')
                .send(_sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').equal("Product 2: SerialNumber not found in stock.");
                    done();
                });
        });

        it('should return a error when out of stock', (done) => {
            const _sale = db.sales[1];
            chai.request(BASE_PATH)
                .post('/sale/create')
                .send(_sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').equal("Product 1: SerialNumber not found in stock.");
                    done();
                });
        });
    });

    describe('GET /sale/get', function () {

        it('should get the sale by id', (done) => {
            chai.request(BASE_PATH)
                .get(`/sale/get/${sale.id}`)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('id').equal(sale.id);
                    res.body.should.have.property('sellerId').equal(sale.sellerId);
                    res.body.should.have.property('productList');
                    res.body.productList.should.be.a('array');
                    res.body.productList.length.should.be.equal(sale.productList.length);
                    done();
                });
        });

        it('should get all sales', (done) => {
            chai.request(BASE_PATH)
                .get('/sale/getAll')
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