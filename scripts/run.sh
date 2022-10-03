#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy!!"
cd /home/ec2-user/alardin-back-test

images=`docker images -aq`
export DH_USERNAME=`aws ssm get-parameters --name DOCKERHUB_USERNAME --query Parameters[0].Value | sed s'/"//g'`
export DH_TOKEN=`aws ssm get-parameters --name DOCKERHUB_TOKEN --query Parameters[0].Value | sed s'/"//g'`
docker login -u $DH_USERNAME -p $DH_TOKEN

docker system prune -f
docker-compose -f docker-compose/docker-compose.server.yml down
if [ ! -n $images ]
then
    docker rmi "$images"
fi
docker-compose -f docker-compose/docker-compose.server.yml pull api-prod && \
    docker-compose -f docker-compose/docker-compose.server.yml start api-prod
# docker-compose -f docker-compose/docker-compose.server.yml up -d --build api-prod
