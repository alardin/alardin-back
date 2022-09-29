#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy!!"
cd /home/ec2-user/alardin-back-test

images=`docker images -aq`

docker system prune -f
docker-compose down -f docker-compose/docker-compose.server.yml
if [ ! -n $images ]
then
    docker rmi "$images"
fi
docker-compose up -f docker-compose/docker-compose.server.yml -d --build api-prod
