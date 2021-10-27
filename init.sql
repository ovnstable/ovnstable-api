create database ovn_analytics;
create user ovn_user with encrypted password 'ovn_password';
grant all privileges on database ovn_analytics to ovn_user;


drop table if exists asset_prices_for_balance;
create table asset_prices_for_balance (
    id varchar primary key ,
    block int,
    created_at timestamp,
    updated_at timestamp,
    symbol varchar,
    decimals int,
    name varchar,
    amount_in_vault numeric,
    usdc_price_in_vault numeric,
    usdc_buy_price numeric,
    usdc_sell_price numeric,
    usdc_price_denominator numeric
);

