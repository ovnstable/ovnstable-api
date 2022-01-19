#!/bin/bash


token=$1
url=$2
stand=$3
tag=1


if [ "$stand" = "prod" ]
then
  nameDapp="dapp-api"
  dockerComposePath="/root/ovn-dev/docker-compose.yaml"
elif [ "$stand" = "dev" ]
then
  nameDapp="dapp-api-dev"
  dockerComposePath="/root/ovn-dev/docker-compose.yaml"
else
  exit
fi

echo "$nameDapp"

echo URL $url
echo Token $token

docker build . -t cr.yandex/crpg11k469bhc8lch9gm/overnight/dapp-api:$tag


docker login \
         --username oauth \
         --password $token \
        cr.yandex

docker push  cr.yandex/crpg11k469bhc8lch9gm/overnight/dapp-api:$tag


ssh $url docker login \
         --username oauth \
         --password $token \
        cr.yandex

ssh $url docker pull cr.yandex/crpg11k469bhc8lch9gm/overnight/dapp-api:$tag
ssh $url docker-compose -f ${dockerComposePath} up -d --no-deps dapp-api

ssh $url docker logs $nameDapp -f
