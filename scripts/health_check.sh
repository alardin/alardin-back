#!/bin/bash

export SNS_HEALTHCHECK_FAIL_ARN=`aws ssm get-parameters --name SNS_HEALTHCHECK_FAIL_ARN --query Parameters[0].Value | sed s'/"//g'`
export SNS_HEALTHCHECK_SUCCESS_ARN=`aws ssm get-parameters --name SNS_HEALTHCHECK_SUCCESS_ARN --query Parameters[0].Value | sed s'/"//g'`

echo "[*] Start health check at 'http://127.0.0.1:3000' ..."

for RETRY_COUNT in 1 2 3 4 5 6 7 8 9 10
do
    echo "[*] #${RETRY_COUNT} trying..."
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health)

    if [ ${RESPONSE_CODE} -eq 200 ]; then
        echo "[+] Server is successfully running"
        aws sns publish --topic-arn $SNS_HEALTHCHECK_SUCCESS_ARN --message "ALIVE"
        exit 0
    elif [ ${RETRY_COUNT} -eq 10 ]; then
        echo "[-] Health check failed."
        aws sns publish --topic-arn $SNS_HEALTHCHECK_FAIL_ARN --message "DEAD"
        exit 1
    fi
    sleep 10
done