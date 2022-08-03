from time import sleep
from requests import *
import schedule

REST_API_KEY = "ce9152602d80b914c1c949be01c523e2"
URL = "https://kauth.kakao.com/oauth/token"

INITIAL_TOKENS = {
    "accessToken": "1mdnFQArviOePWmq133wldhuTj3DxpIXe2VOL8dCCilwUAAAAYJejw1U", 
    "refreshToken": "uS-X_E3UlYtSs-GKwgJg2ZMPmORIQZ9zbtGIOKu5CilwUAAAAYJejw1T",
    "deviceToken": "eKYd1k59cEyJp9ZQIhNN_M:APA91bGYBoknV1AnpEPJl3LlqSddZyZWsvlgF9ilZkspe5jMVTmJUYysIiVHhe4Tw7ZS0MNGvmavY7nRc3TBpHeCI6UfFcYMOMTQlTTa2qBtPEUlheOBa8do8sVMldaY4m9_We7aw-Ov"
}
def refresh(refresh_token):
    data = {
        "grant_type": "refresh_token",
        "client_id": REST_API_KEY,
        "refresh_token": refresh_token
    }    
    r = post(URL, data=data)
    new_token = r.json()
    print (f'access_token: ${new_token["access_token"]}')
# print('[*] SCHEDULER STARTED')
# schedule.every(15).minutes.do(refresh, INITIAL_TOKENS["refreshToken"])


refresh(INITIAL_TOKENS["refreshToken"]);
