
To create a Short url

curl --location 'http://localhost:9000/shorturls/' \
--header 'Content-Type: application/json' \
--data '{
    "url": "https://cicd.datanimbus.io/cicd/",
    "validity": 32
    
}'
Result
{
    "shortLink": "http://localhost:9000/5FWmLN",
    "expiry": "2025-07-14T06:44:36.385Z"
}


To get the stat

curl --location 'http://localhost:9000/shorturls/XpEIvG'
Result
{
    "shortLink": "http://localhost:9000/XpEIvG",
    "expiry": "2025-07-14T06:26:19.607Z",
    "clicks": 2,
    "originalUrl": {
        "protocol": "https:",
        "hostname": "cicd.datanimbus.io",
        "pathname": "/cicd/",
        "search": "",
        "hash": "",
        "href": "https://cicd.datanimbus.io/cicd/"
    },
    "clickData": [
        {
            "timestamp": "2025-07-14T05:59:50.095Z",
            "source": "Unknown",
            "location": "::1",
            "_id": "68749cd67c951a58e65a8703"
        },
        {
            "timestamp": "2025-07-14T06:00:26.945Z",
            "source": "Unknown",
            "location": "::1",
            "_id": "68749cfa7c951a58e65a8709"
        }
        ]
}


Api to get to run the short URL
curl --location 'http://localhost:9000/XpEIvG'
