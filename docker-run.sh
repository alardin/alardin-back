docker run -p 80:3000 -e PORT=3000 -e KAKAO_ADMIN_KEY=890638e40a5a0d6955b1a682ba1fbc18 \
-e JWT_SECRET=1689de6c3c236ad9a47a4fb0fe167ec9b2fee9de61e936ded0504660f21ba224 \
-e DB_USERNAME=root \
-e DB_PASSWORD=63104225 \
-e DB_DATABASE=alardin \
-e DB_PORT=3306 \
-e DB_HOST=alardin-mysql.cxfgciqmxjqv.ap-northeast-2.rds.amazonaws.com \
-e REDIS_HOST=localhost \
-e REDIS_PORT=6379 \
-e ADMIN_EMAILS=airmancho@gmail mithan1@naver.com desummit1@gmail.com \
-e AGORA_APP_ID=cdcb4468d781460d8e608d0156a8ff3c \
-e AGORA_APP_CERTIFICATE=2d85d47afc8b4d6f8e2a1a224af8a890 \
$1 