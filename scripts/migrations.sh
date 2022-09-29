#!/bin/bash

echo "[*] RUN Migrate"
cd /home/ec2-user/alardin-back-migrations
npm install && npm run migrate:run && cd .. && rm -rf alardin-back-migrations