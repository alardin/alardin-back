#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy"
cd /home/ec2-user/alardin-back-test && cp /home/ec2-user/.alardin-envs/.dev.env .env
images=`docker images -aq`
export DH_USERNAME=`aws ssm get-parameters --name DOCKERHUB_USERNAME --query Parameters[0].Value | sed s'/"//g'`
export DH_USERNAME=`aws ssm get-parameters --name DOCKERHUB_USERNAME --query Parameters[0].Value | sed s'/"//g'`
export DH_TOKEN=`aws ssm get-parameters --name DOCKERHUB_TOKEN --query Parameters[0].Value | sed s'/"//g'`
export DOCKER_REGISTRY=`aws ssm get-parameters --name DOCKER_REGISTRY --query "Parameters[0].Value" | sed s'/"//g'`
export DOCKER_APP_NAME=`aws ssm get-parameters --name DOCKER_APP_NAME --query "Parameters[0].Value" | sed s'/"//g'`
export IMAGE_TAG=`aws ssm get-parameters --name IMAGE_TAG --query "Parameters[0].Value" | sed s'/"//g'`

docker login -u $DH_USERNAME -p $DH_TOKEN

docker system prune -f
docker-compose -f docker-compose/docker-compose.server.yml down
if [ ! -n $images ]
then
    docker rmi "$images"
fi

docker-compose -f docker-compose/docker-compose.server.yml pull api-test && \
    docker-compose -f docker-compose/docker-compose.server.yml up -d api-test
# docker-compose -f docker-compose/docker-compose.server.yml up -d --build api-prod
