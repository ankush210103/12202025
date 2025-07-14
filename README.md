
To create a Short url

curl --location 'http://localhost:9000/shorturls/' \
--header 'Content-Type: application/json' \
--data '{
    "url": "https://cicd.datanimbus.io/cicd/",
    "validity": 32
    
}'
Result
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8c106086-837c-4792-b412-7836b521b60e" />



To get the stat

curl --location 'http://localhost:9000/shorturls/hyGVFY'
Result
 <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5e6803a4-059b-422c-bf25-3e58da85184d" />




