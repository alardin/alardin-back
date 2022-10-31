#!/bin/bash

cp .prod.env .prod-temp.env
aws s3 mv .prod.env s3://alardin-envs/.prod.env
mv .prod-tmp.env .prod.env

git add .
git commit
git push