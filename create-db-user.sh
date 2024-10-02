#!/usr/bin/env bash

docker-compose exec linkup-db_dev sh -c "mongosh -u admin -p G0jl2sSfWHXpo4o4d5HXqLR5Oveiik --eval \"db.getSiblingDB('linkup').createUser({user:'linkup-api',pwd:'3yzZmGRdWE1ZADpKKlj1WwnVm8I7SM',roles:[{role:'readWrite',db:'linkup'}]})\""