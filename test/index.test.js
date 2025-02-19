var $require = require('proxyquire');
var sinon = require('sinon');
var chai = require('chai');
var expect = require('chai').expect;
var action = require('..');


describe('auth0-findidp-action', function() {
  
  it.skip('should do something', function(done) {
    chai.auth0.action(action)
    .event(function(event) {
      event.transaction = { identifier: 'alice@foo.com' };
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
  
  it('should set connection to username-password when existing password-based account exists', function(done) {
    var client = new Object();
    client.usersByEmail = new Object();
    client.usersByEmail.getByEmail = sinon.stub().resolves({
      data: [ {
        email: 'alice@example.com',
        email_verified: false,
        identities: [
          {
            connection: 'Username-Password-Authentication',
            provider: 'auth0',
            user_id: '9a3f88f67f9b90c5f1fd65e0',
            isSocial: false
          }
        ],
        name: 'alice@example.com',
        nickname: 'alice',
        user_id: 'auth0|9a3f88f67f9b90c5f1fd65e0'
      } ]
    });
    client.connections = new Object();
    client.connections.getAll = sinon.spy();
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
        event.transaction = { identifier: 'alice@gmail.com' };
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
        expect(client.usersByEmail.getByEmail).to.have.been.calledOnceWith({ email: 'alice@gmail.com' });
        expect(client.connections.getAll).to.not.have.been.called;
        expect(dnsPromises.resolve).to.not.have.been.called;
        expect(api.setConnection).to.be.calledOnceWith('Username-Password-Authentication');
        done();
      })
      .catch(done);
  }); // should set connection to username-password when existing password-based account exists
  
  it('should set connection to Google when MX records resolve to Gmail', function(done) {
    var client = new Object();
    client.usersByEmail = new Object();
    client.usersByEmail.getByEmail = sinon.stub().resolves({ data: [] });
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
        { exchange: 'gmail-smtp-in.l.google.com', priority: 5 },
        { exchange: 'alt3.gmail-smtp-in.l.google.com', priority: 30 },
        { exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 20 },
        { exchange: 'alt4.gmail-smtp-in.l.google.com', priority: 40 },
        { exchange: 'alt1.gmail-smtp-in.l.google.com', priority: 10 }
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
        event.transaction = { identifier: 'alice@gmail.com' };
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
        expect(dnsPromises.resolve).to.have.been.calledOnceWith('gmail.com', 'MX');
        expect(api.setConnection).to.be.calledOnceWith('google-oauth2');
        done();
      })
      .catch(done);
  }); // should set connection to Google when MX records resolve to Gmail
  
  it('should set connection to Google when MX records resolve to Google Workspace', function(done) {
    var client = new Object();
    client.usersByEmail = new Object();
    client.usersByEmail.getByEmail = sinon.stub().resolves({ data: [] });
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
        event.transaction = { identifier: 'alice@acme.com' };
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
        expect(dnsPromises.resolve).to.have.been.calledOnceWith('acme.com', 'MX');
        expect(api.setConnection).to.be.calledOnceWith('google-oauth2');
        done();
      })
      .catch(done);
  }); // should set connection to Google when MX records resolve to Google Workspace
  
  it('should set enterprise connection configured for home realm discovery', function(done) {
    var client = new Object();
    client.usersByEmail = new Object();
    client.usersByEmail.getByEmail = sinon.stub().resolves({ data: [] });
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
  
  it('should ignore phone number identifier', function(done) {
    var client = new Object();
    client.usersByEmail = new Object();
    client.usersByEmail.getByEmail = sinon.spy();
    client.connections = new Object();
    client.connections.getAll = sinon.spy();
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
        event.transaction = { identifier: '(800) 555‑0175' };
      })
      .trigger('post-identifier')
      .then(function(api) {
        expect(client.usersByEmail.getByEmail).to.not.have.been.called;
        expect(client.connections.getAll).to.not.have.been.called;
        expect(dnsPromises.resolve).to.not.have.been.called;
        expect(api.setConnection).to.not.have.been.called;
        done();
      })
      .catch(done);
  }); // should ignore phone number identifier
  
});
