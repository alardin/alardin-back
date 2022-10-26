#!/bin/bash

echo "[*] RUN Migrate"
docker system prune -f
cd /home/ec2-user/alardin-back-migrations
cp ../.alardin-envs/.migration.env .env && npm install && npm run migrate:run && cd .. && rm -rf alardin-back-migrations