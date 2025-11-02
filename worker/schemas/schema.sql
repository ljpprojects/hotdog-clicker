drop table if exists savedat;

create table savedat(
    identifier text not null primary key, -- A randomly generated string used to identify users
    encoded_save text not null,           -- The most recent encoded save.
    nickname text not null,               -- A user picked string which will be dispayed on the leaderboard.
    net_worth decimal not null,           -- The total worth of the user's assets (hdnw)
);

-- There is a user with identifier "taxes|user" which has the amount lost to taxes stored as its hdnw
-- It is now defunct, though, so we should not create that user on new databases
-- In the future, the user will be removed and the funds redistributed amongst those on the leaderboard.
-- Those higher ranking on the leaderboard will receive less funds than those lower ranking.

-- Create a table for storing public keys of users who have opted into save signing
--
-- We only need to store the public key, since if the server can sign save data as any user
-- we have defeated the point of signing it in the first place.
--
-- NOTE: Enabling save signing does not make save recovery harder, but recovered saves cannot
--       be signed with the same key.
--
-- NOTE: Don't create the table yet, but keep its definition here for when it is ready
--
-- create table savesigndat(
--     identifier text not null primary key, -- Same as savedat.identifier
--     pubkey text not null unique,          -- The public key created which can be used to verify the signatures of signed saves.
-- );
