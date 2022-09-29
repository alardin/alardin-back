#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy!"
cd /home/ec2-user/alardin-back-test

echo "[*] RUN Migrate"
npm install && npm run migrate:run
rm -rf node_modules

docker system prune -f
docker-compose down
docker rmi $(docker images -aq)
docker-compose up -d --build api-prod