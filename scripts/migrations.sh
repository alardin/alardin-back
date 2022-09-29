#!/bin/bash

echo "[*] RUN Migrate"
cd ~/alardin-back-migration
docker-compose -f docker-compose/docker-compose.migrations.yml up && \
docker-compose -f docker-compose/docker-compose.migrations.yml down