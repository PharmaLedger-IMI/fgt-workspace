const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const {db} = require("../controls/db/db");
const {PHA_API, getTokenFromCredentials} = require("../controls/utils");


describe('saleApi', function () {
    require("./shipmentApi.test");
    const auth = {Authorization: `Basic ${getTokenFromCredentials("fgt-pharmacy-wallet")}`}

    describe('POST /sale/create', function () {

        it('should return a error when try to sale the same product twice', (done) => {
            let sale = db.sales[2];
            const productList = [...sale.productList, ...sale.productList];
            sale = Object.assign({}, sale, {productList});
            chai.request(PHA_API)
                .post('/sale/create')
                .set(auth)
                .send(sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').to.include(`trying to sold a product more than once.`);
                    done();
                });
        });

        it('should create a sale', (done) => {
            const sale = db.sales[2];
            chai.request(PHA_API)
                .post('/sale/create')
                .set(auth)
                .send(sale)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.assert.isNotEmpty(res.body);
                    res.body.should.have.property('id').equal(sale.id);
                    res.body.should.have.property('sellerId').equal(sale.sellerId);
                    res.body.should.have.property('productList');
                    res.body.productList.should.be.a('array');
                    res.body.productList.length.should.be.equal(sale.productList.length);
                    res.body.should.have.property('keySSIs');
                    res.body.keySSIs.should.be.a('array');
                    done();
                });
        });

        it('should return a error when insert a saleId that already exist', (done) => {
            const sale = db.sales[2];
            chai.request(PHA_API)
                .post('/sale/create')
                .set(auth)
                .send(sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').equal(`Could not insert record with id ${sale.id} on table sales`);
                    done();
                });
        });

        it('should return a error when try to sale a product recalled', (done) => {
            const sale = db.sales[0];
            chai.request(PHA_API)
                .post('/sale/create')
                .set(auth)
                .send(sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').to.include(`is not available for sale, because batchStatus is recall`);
                    done();
                });
        });

        it('should return a error when out of stock', (done) => {
            const sale = db.sales[3];
            chai.request(PHA_API)
                .post('/sale/create')
                .set(auth)
                .send(sale)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(501);
                    res.body.should.have.property('status').equal(501);
                    res.body.should.have.property('error').equal('Not implemented');
                    res.body.should.have.property('message').to.include("SerialNumber not found in stock.");
                    done();
                });
        });
    });

    describe('GET /sale/get', function () {

        it('should get the sale by id', (done) => {
            const sale = db.sales[2];
            chai.request(PHA_API)
                .get(`/sale/get/${sale.id}`)
                .set(auth)
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
            chai.request(PHA_API)
                .get('/sale/getAll')
                .set(auth)
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