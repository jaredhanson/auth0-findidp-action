const ManagementClient = require('auth0').ManagementClient;
const Address = require('address-rfc2821').Address;
const dns = require('dns').promises;


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
  let address;
  
  // Attempt to parse the identifer as an email address.
  try {
    address = new Address(event.transaction.identifier);
  } catch (ex) {
    // The identifer is not an email address.  Immediately return from the
    // action, letting the Auth0 platform continue with default behavior.  Note
    // that default behavior includes executing additional actions, which may
    // handle other types of identifiers.
    return;
  }
  
  // Connect to the [Auth0 Mangement API][1] using the client credentials that
  // have been added as [secrets][2].  It is [recommended][3] that a machine-to-
  // machine application be created for this action with the following
  // permissions: read:users, read:connections.
  //
  // [1]: https://auth0.com/docs/api/management/v2
  // [2]: https://auth0.com/docs/customize/actions/write-your-first-action#add-a-secret
  // [3]: https://community.auth0.com/t/how-can-i-use-the-management-api-in-actions/64947
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
  
  
  // If the user already exists in the system, sign them in using the existing
  // authentication method.
  
  var resp = await client.usersByEmail.getByEmail({ email: address.address() });
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
  
  // If the domain matches that of a domain [associated with an enterprise
  // connection][1], direct the user to that connection in order to sign in.
  // This is typically used in [business-to-business][2] (B2B) scenarios.  This
  // preserves the default Auth0 platform behavior, so that use of this action
  // doesn't have unexpected impact.
  //
  // [1]: https://auth0.com/docs/authenticate/login/auth0-universal-login/identifier-first#define-home-realm-discovery-identity-providers
  // [2]: https://auth0.com/docs/get-started/architecture-scenarios/business-to-business/authentication
  var connection = connections.find((c) => c.options && c.options.domain_aliases && c.options.domain_aliases.includes(address.host));
  if (connection) {
    api.setConnection(connection.name);
    return;
  }
  
  
  // Discover the identity provider (IDP) for the user's domain.
  
  // TODO: Implement support for WebFinger.
  
  
  // Use DNS MX records to determine the IDP for the domain.
  var records = await dns.resolve(address.host, 'MX');
  //console.log(records);
  
  //records.sort(function(lhs, rhs) { console.log(rhs); return rhs.priority < lhs.priority; });
  
  var conn = EXCHANGES[records[0].exchange.toLowerCase()];
  
  if (conn) {
    console.log('SEND TO IDP: ' + conn);
    console.log(api);
    api.setConnection(conn);
  }
};
