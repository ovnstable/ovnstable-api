create database ovn_analytics;
create user ovn_user with encrypted password 'ovn_password';
grant all privileges on database ovn_analytics to ovn_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ovn_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ovn_user;

drop table if exists asset_prices_for_balance;
create table asset_prices_for_balance (
    id uuid primary key ,
    active varchar,
    active_name varchar,
    created_at timestamp,
    updated_at timestamp,

    position decimal,
    market_price decimal,
    net_asset_value decimal,
    liquidation_price decimal,
    liquidation_value decimal,
    type varchar,
    amount decimal,
    amount_fee decimal,
    sender varchar,
    balance_ovn decimal,
    transaction_hash varchar
);

grant all privileges on table asset_prices_for_balance to ovn_user;
