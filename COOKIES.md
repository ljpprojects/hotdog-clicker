# Cookie Policy

Hot Dog Clicker uses cookies, and this document will outline exactly how cookies are used.

## What are they for?

When you first play Hot Dog Clicker, a request is made to the server to create a save.
The server, seeing that you have not played before (and therefore have no identifier cookie)
issues an identifier cookie as a part of its response.

The identifier cookie is used only to identify which user you are, and therefore which save
should be loaded when a load request is made to the server. If the server did not have this
cookie, it would be unable to read or write to the correct save in the database, as it
would not know which user you are.

The identifier cookie is *not* used for any of the purposes below:

* Targeting ads
* Analytics/telemetry of any form
* Tracking you across any other websites, including other `ljpprojects.org` sites
* Associating data with any user outside of that which is described elsewhere in this document
* Any other purpose not outlined in this document.

## How do I check the validity of these claims?

If you would like to check the validity of this document, you can look through the source code
of the Cloudflare Worker. There, you can see exactly what data is stored in association with
the identifier cookie (in [schemas/schema.sql](worker/schemas/schema.sql)).

## Why can't I reject them?

They are essential for the game to function properly and serve a purely functional purpose.
