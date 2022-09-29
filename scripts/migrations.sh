#!/bin/bash

echo "[*] RUN Migrate"
cd ~/alardin-back-migrations
npm install && npm run migrate:run && cd .. && rm -rf alardin-back-migrations