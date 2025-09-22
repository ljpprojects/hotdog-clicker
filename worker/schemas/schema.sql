drop table if exists savedat;

create table savedat(
    identifier text not null primary key, -- A randomly generated string used to identify users
    encoded_save text NOT null,           -- The most recent encoded save.
    nickname text not null,               -- A user picked string which will be dispayed on the leaderboard.
    net_worth decimal not null            -- The total worth of the user's assets (hdnw)
);

-- This is a very bad way to achieve what I am trying to achieve
-- I am adding a user to be displayed on the leaderboard which shows the accumulated loss due to taxes

insert into savedat(identifier, encoded_save, nickname, net_worth)
values (
    "taxes|user",
    "eyJoZGMiOjAsImhkcHMiOjAsImhkbnciOjAsIm93bmVkQnVucyI6MCwib3duZWREYWRzIjowLCJvd25lZEdyaWxscyI6MCwib3duZWRGYXJtcyI6MCwib3duZWRGYWN0b3JpZXMiOjAsIm93bmVkQmFua3MiOjAsIm93bmVkRnJlZXplcnMiOjAsIm93bmVkUG9ydGFscyI6MCwib3duZWRXb3JtaG9sZXMiOjAsIm5pY2tuYW1lIjoiPG5vdCBnaXZlbj4ifQ==",
    "Total Paid Tax",
    0
);
