#!/bin/bash


token=$1
url=$2
name=$3
tag=1

echo URL $url
echo Token $token

docker build . -t cr.yandex/crpg11k469bhc8lch9gm/overnight/$name:$tag


docker login \
         --username oauth \
         --password $token \
        cr.yandex

docker push  cr.yandex/crpg11k469bhc8lch9gm/overnight/$name:$tag


ssh $url docker login \
         --username oauth \
         --password $token \
        cr.yandex

ssh $url docker pull cr.yandex/crpg11k469bhc8lch9gm/overnight/$name:$tag
ssh $url docker-compose -f /root/ovn/docker-compose.yaml up -d --no-deps ovn-$name

ssh $url docker logs ovn-$name -f
