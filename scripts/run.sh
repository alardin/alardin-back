#!/bin/bash

echo "[*] RUN SERVER by CodeDeploy"
docker system prune -f
docker-compose up -d --build api-prod