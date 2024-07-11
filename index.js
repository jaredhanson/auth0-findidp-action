const ManagementClient = require('auth0').ManagementClient;
const Address = require('address-rfc2821').Address;
var dns = require('dns').promises;


const EXCHANGES = {
  'gmail-smtp-in.l.google.com': 'google-oauth2',
  'alt1.gmail-smtp-in.l.google.com': 'google-oauth2',
  'alt2.gmail-smtp-in.l.google.com': 'google-oauth2',
  'alt3.gmail-smtp-in.l.google.com': 'google-oauth2',
  'alt4.gmail-smtp-in.l.google.com': 'google-oauth2',
  'aspmx.l.google.com': 'google-oauth2',
  'alt1.aspmx.l.google.com': 'google-oauth2',
  'alt2.aspmx.l.google.com': 'google-oauth2',
  'alt3.aspmx.l.google.com': 'google-oauth2',
  'alt4.aspmx.l.google.com': 'google-oauth2',
};


exports.onExecutePostIdentifier = async (event, api) => {
  var parsed;
  
  try {
    parsed = new Address(event.transaction.identifier);
    //console.log(parsed);
  } catch (ex) {
    //console.log(ex);
    return;
  }
  
  /*
  return new Promise(function(resolve, reject) {
    
  })
  */
  
  const client = new ManagementClient({
    domain: event.secrets.AUTH0_DOMAIN || event.request.hostname,
    clientId: event.secrets.AUTH0_CLIENT_ID,
    clientSecret: event.secrets.AUTH0_CLIENT_SECRET,
  });
  
  
  // If we have an existing user with this identifier, route them to that connection
  // This allows people wiht password-based accounts to continue to use them after findIDP has been turned on
  // https://auth0.com/docs/manage-users/user-search/retrieve-users-with-get-users-by-email-endpoint
  //
  // TODO: should probably limit this to just password-based accounts, so external IDPs with an email don't override
  var resp = await client.usersByEmail.getByEmail({ email: event.transaction.identifier });
  var users = resp.data;
  if (users.length != 0) {
    api.setConnection(users[0].identities[0].connection);
    return;
  }
  
  // Preserve home realm discovery
  // https://auth0.com/docs/authenticate/login/auth0-universal-login/identifier-first#define-home-realm-discovery-identity-providers
  
  var resp = await client.connections.getAll();
  var connections = resp.data;
  //console.log(connections);
  
  var connection = connections.find((e) => e.options && e.options.domain_aliases && e.options.domain_aliases.includes(parsed.host));
  if (connection) {
    api.setConnection(connection.name);
    return;
  }
  
  
  
  var records = await dns.resolve(parsed.host, 'MX');
  //console.log(records);
  
  //records.sort(function(lhs, rhs) { console.log(rhs); return rhs.priority < lhs.priority; });
  
  var conn = EXCHANGES[records[0].exchange.toLowerCase()];
  
  if (conn) {
    console.log('SEND TO IDP: ' + conn);
    console.log(api);
    api.setConnection(conn);
  }
};
