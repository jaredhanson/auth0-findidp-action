var $require = require('proxyquire');
var sinon = require('sinon');
var chai = require('chai');
var expect = require('chai').expect;
var action = require('..');


describe('auth0-findidp-action', function() {
  
  it.skip('should do something', function(done) {
    chai.auth0.action(action)
    .event(function(event) {
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
  
  it('should set connection to Google when MX records resolve to Google Workspace', function(done) {
    var client = new Object();
    client.connections = new Object();
    client.connections.getAll = sinon.stub().resolves({
      data: [ {
        id: 'con_cHABA2V0Xbiiopvo',
        options: {
          email: true,
          calendar: false,
          contacts: false
        },
        strategy: 'google-oauth2',
        name: 'google-oauth2',
        realms: [ 'google-oauth2' ]
      } ]
    });
    var MockManagementClient = sinon.stub().returns(client);
    var dnsPromises = {
      resolve: sinon.stub().resolves([
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'alt3.aspmx.l.google.com', priority: 10 },
        { exchange: 'alt4.aspmx.l.google.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ])
    };
    
    var action = $require('..', {
      'auth0': { ManagementClient: MockManagementClient },
      'dns': { promises: dnsPromises }
    });
    
    chai.auth0.action(action)
      .api(function(api) {
        sinon.spy(api)
      })
      .event(function(event) {
        event.transaction = { identifier: 'alice@example.com' };
        event.request = { hostname: 'example.auth0.com' };
      })
      .secret('AUTH0_CLIENT_ID', 's6BhdRkqt3')
      .secret('AUTH0_CLIENT_SECRET', '7Fjfp0ZBr1KtDRbnfVdmIw')
      .trigger('post-identifier')
      .then(function(api) {
        expect(MockManagementClient).to.have.been.calledOnceWith({
          domain: 'example.auth0.com',
          clientId: 's6BhdRkqt3',
          clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
        });
        expect(dnsPromises.resolve).to.have.been.calledOnceWith('example.com', 'MX');
        expect(api.setConnection).to.be.calledOnceWith('google-oauth2');
        done();
      })
      .catch(done);
  }); // should set enterprise connection configured for home realm discovery
  
  it('should set enterprise connection configured for home realm discovery', function(done) {
    var client = new Object();
    client.connections = new Object();
    client.connections.getAll = sinon.stub().resolves({
      data: [ {
        id: 'con_emlIciuTnbWDi7w7',
        options: {
          tenant_domain: 'example.com',
          domain_aliases: [ 'example.com' ]
        },
        strategy: 'oidc',
        name: 'example-com',
        realms: [ 'example-com' ]
      } ]
    });
    var MockManagementClient = sinon.stub().returns(client);
    var dnsPromises = {
      resolve: sinon.spy()
    };
    
    var action = $require('..', {
      'auth0': { ManagementClient: MockManagementClient },
      'dns': { promises: dnsPromises }
    });
    
    chai.auth0.action(action)
      .api(function(api) {
        sinon.spy(api)
      })
      .event(function(event) {
        event.transaction = { identifier: 'alice@example.com' };
        event.request = { hostname: 'example.auth0.com' };
      })
      .secret('AUTH0_CLIENT_ID', 's6BhdRkqt3')
      .secret('AUTH0_CLIENT_SECRET', '7Fjfp0ZBr1KtDRbnfVdmIw')
      .trigger('post-identifier')
      .then(function(api) {
        expect(MockManagementClient).to.have.been.calledOnceWith({
          domain: 'example.auth0.com',
          clientId: 's6BhdRkqt3',
          clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
        });
        expect(dnsPromises.resolve).to.not.have.been.called;
        expect(api.setConnection).to.be.calledOnceWith('example-com');
        done();
      })
      .catch(done);
  }); // should set enterprise connection configured for home realm discovery
  
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
