# LiveChatCCB

## NEED FFPROBE INSTALLED

docker build -t qlaffont-livechatccb .
docker run -p 3000:3000 qlaffont-livechatccb \
-e DISCORD_TOKEN='DISCORD-TOKEN-TO-REPLACE' \
-e DISCORD_CLIENT_ID='DISCORD-ID-TO-REPLACE' \
-e API_URL='API-URL-TO-REPLACE'
