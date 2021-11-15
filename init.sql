CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS anal;
CREATE SCHEMA IF NOT EXISTS widget;


drop table if exists widget.distribution_rate;
create table widget.distribution_rate
(
    label       varchar primary key,
    normal_dist decimal,
    ovn_dist    decimal,
    created_at  timestamp,
    updated_at  timestamp
);


drop table if exists widget.interest_rate;
create table widget.interest_rate
(
    id         uuid primary key,
    date       varchar,
    value      decimal,
    created_at timestamp,
    updated_at timestamp
);

drop table if exists widget.polybor_weeks_table;
create table widget.polybor_weeks_table
(
    id         uuid primary key,
    label      varchar,
    latest     decimal,
    week_ago   decimal,
    high       decimal,
    low        decimal,
    created_at timestamp,
    updated_at timestamp
);

drop table if exists widget.polybor_week;
create table widget.polybor_week
(
    id         uuid primary key,
    latest     decimal,
    week       decimal,
    day        decimal,
    created_at timestamp,
    updated_at timestamp
);

drop table if exists widget.polybor;
create table widget.polybor
(
    id         uuid primary key,
    latest     decimal,
    week       decimal,
    day        decimal,
    created_at timestamp,
    updated_at timestamp
);


drop table if exists anal.payouts;
create table anal.payouts
(
    transaction_hash        varchar primary key,
    block                   int,
    payable_date            timestamp without time zone,
    total_ovn               decimal,
    total_usdc              decimal,
    totally_amount_rewarded decimal,
    totally_saved           decimal,
    daily_profit            decimal,
    elapsed_time            decimal,
    annualized_yield        decimal,
    sender                  varchar,
    created_at              timestamp
);


drop table if exists anal.total_ovn;
create table anal.total_ovn
(
    minted      decimal,
    circulation decimal,
    burn        decimal,
    date        timestamp primary key
);


drop table if exists anal.m2m;
create table anal.m2m
(
    id                uuid primary key,
    block             int,
    active            varchar,
    type              varchar,
    value             decimal,
    created_at        timestamp,
    position          decimal,
    market_price      decimal,
    net_asset_value   decimal,
    liquidation_price decimal,
    liquidation_value decimal,
    date              timestamp,
    transaction_hash  varchar,
    fee               decimal
);


drop table if exists anal.mint_redeem;
create table anal.mint_redeem
(
    transaction_hash varchar primary key,
    date             timestamp,
    block            int not null,
    type             varchar not null,
    value            decimal not null,
    created_at       timestamp,
    sender           varchar not null,
    fee              decimal
);
