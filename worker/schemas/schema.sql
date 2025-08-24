drop table if exists savedat;

create table savedat(
    identifier text not null primary key, /* A randomly generated string used to identify users */
    encoded_save text NOT null,           /* The most recent encoded save. */
    nickname text not null,               /* A user picked string which will be dispayed on the leaderboard.  */
    net_worth decimal not null            /* The total worth of the user's assets (hdnw) */
);
