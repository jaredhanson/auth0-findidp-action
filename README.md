# findIDP Action for Auth0

This repository contains an [Auth0](https://auth0.com) [Actions](https://auth0.com/docs/customize/actions)
function that customizes an [identifier first](https://auth0.com/docs/authenticate/login/auth0-universal-login/identifier-first)
login flow to allow users to sign in without requiring a password or choosing an
identity provider.

A typical sign in screen is problematic.  It asks the user to enter (or create)
a password - an insecure credential that exposes them to risk of phishing and
identity theft.  Social login is often offered as an alternative, allowing the
user to login with their existing Google, Apple, or social network account.
While this avoids the problem of passwords, it creates a new problem - returning
users must remember which choice they made when they subsequently return to the
site and want to access their account.  Enterprise applications that allow
employees to sign in using their corporate account introduce even more variation -
and thus confusion - into the sign in experience.

Identifier first login flows can streamline the sign in process.  The user is
prompted to enter their email address, and are automatically directed to the
easiest - and most secure - method for signing in.  It even works for both
personal and work email addresses.

The inspiration for this flow comes from [Tim Bray](https://en.wikipedia.org/wiki/Tim_Bray)'s
[Project findIDP](https://www.tbray.org/ongoing/When/201x/2013/06/07/Why-findIDP),
itself inspired by [Blaine Cook](https://en.wikipedia.org/wiki/Blaine_Cook_(programmer))'s
attempt at [fixing sign in](https://archive.ph/7BzFP) to (now defunct) Poetica.
The project, circa 2013, was an attempt to encourage this style of flow and offer
it as a service [written in Go and running on App Engine](https://www.tbray.org/ongoing/When/201x/2013/06/14/FindIDP-Tech-Choice)
([source code](https://github.com/google/favcolor-findidp)).  The project seems
to have stalled shortly thereafter.

Since then, identifier first flows have become more common, but still are not
as seamless as they could be.  Personal email addresses typically continue to
encourage passwords or other site-specific credentials.   Work email addresses
will often federate with a corporate IDP, but require administrative
configuration before doing so.

This project continues the effort to push identifier first flows as far as
possible, in an attempt to achive both maximum usability and maximum security.
It runs as an Auth0 Action, so the flow can be deployed by any application using
Auth0 for authentication.
