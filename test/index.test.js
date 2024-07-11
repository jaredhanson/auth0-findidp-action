var $require = require('proxyquire');
var sinon = require('sinon');
var chai = require('chai');
var expect = require('chai').expect;
var action = require('..');


describe('auth0-action-findidp', function() {
  
  it('should add helper to chai', function() {
    expect(chai.auth0).to.be.an('object');
    expect(chai.auth0.action).to.be.a('function');
  });
  
  it.skip('should do something', function(done) {
    chai.auth0.action(action)
    .event(function(event) {
      console.log('EVENT!');
      event.transaction = { identifier: 'alice@example.com' };
      event.request = {};
    })
    .secret('AUTH0_DOMAIN', process.env.AUTH0_DOMAIN)
    .secret('AUTH0_CLIENT_ID', process.env.AUTH0_CLIENT_ID)
    .secret('AUTH0_CLIENT_SECRET', process.env.AUTH0_CLIENT_SECRET)
    .trigger('post-identifier')
    .then(function(api) {
      done();
    })
    .catch(done);
  }); // should invoke sync callback
  
  it.skip('should route to enterprise connection', function(done) {
    var client = new Object();
    client.connections = new Object();
    client.connections.getAll = sinon.stub().resolves({
      data: [ {
        id: 'con_XXX',
        name: 'foo-conn',
        options: {
          tenant_domain: 'example.com',
          domain_aliases: [ 'example.com' ]
        }
      } ]
    });
    
    var MockManagementClient = sinon.stub().returns(client);
    
    
    
    var action = $require('..',
      { 'auth0': { ManagementClient: MockManagementClient } });
    
    chai.auth0.action(action)
    .api(function(api) {
      console.log('API...');
      console.log(api);
      sinon.spy(api)
    })
    .event(function(event) {
      console.log('EVENT!');
      event.transaction = { identifier: 'alice@example.com' };
      event.request = {};
    })
    .secret('AUTH0_DOMAIN', process.env.AUTH0_DOMAIN)
    .secret('AUTH0_CLIENT_ID', process.env.AUTH0_CLIENT_ID)
    .secret('AUTH0_CLIENT_SECRET', process.env.AUTH0_CLIENT_SECRET)
    .trigger('post-identifier')
    .then(function(api) {
      
      //expect(1).to.equal(2);
      
      expect(api.setConnection).to.be.calledOnceWith('foo-conn');
      
      done();
    })
    .catch(done);
  }); // should route to enterprise connection
  
  it.skip('should ignore phone numbers', function(done) {
    chai.auth0.action(action)
    .event(function(event) {
      console.log('EVENT!');
      event.transaction = { identifier: '(800) 555‑0175' };
    })
    .trigger('post-identifier', function(api) {
      //expect(api.access).to.be.an('object');
      done();
    });
  }); // should invoke sync callback
  
});
