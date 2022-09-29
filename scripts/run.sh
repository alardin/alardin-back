#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy!!"
cd /home/ec2-user/alardin-back-test

images=`docker images -aq`
compose-file=""

docker system prune -f
docker-compose -f docker-compose/docker-compose.server.yml down
if [ ! -n $images ]
then
    docker rmi "$images"
fi
docker-compose up -f docker-compose/docker-compose.server.yml -d --build api-prod
