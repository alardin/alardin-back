#!/bin/bash

echo "[*] RUN Migrate"
cd ~/alardin-back-migrations
docker-compose -f docker-compose/docker-compose.migrations.yml up --build && \
docker-compose -f docker-compose/docker-compose.migrations.yml down -v