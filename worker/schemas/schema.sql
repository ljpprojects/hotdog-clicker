DROP TABLE IF EXISTS savedat;

CREATE TABLE IF NOT EXISTS savedat(
    identifier text NOT NULL PRIMARY KEY, /* A randomly generated string to identify users */
    claimtk text NOT NULL UNIQUE,         /* The claim token is used to claim an entry in the db once re-authenticated. Rotates on use. */
    verifykey text NOT NULL UNIQUE,       /* The public key associated with the claim token, but not returned by the get action. Only used to verify the signature. */
    encoded_save text NOT NULL,           /* The most recent encoded save. */
    nickname text NOT NULL                /* A user picked string which will be dispayed on the leaderboard.  */
);
