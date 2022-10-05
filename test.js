const axios = require('axios');
const qs = require('qs');
const bcrypt = require('bcryptjs')

async function t() {

    const a = await bcrypt.compare('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pdGhhbjFAbmF2ZXIuY29tIiwiaWF0IjoxNjY0OTU3NjQ4LCJleHAiOjE2Njc1NDk2NDgsImlzcyI6ImFsYXJkaW4iLCJzdWIiOiIxIn0.cgcPSqzbsvO8E0MLI5AeiEKv7ubGIaXgIsbngcxahpo','$2a$12$EvDZYFOSHk594KbvmnYpjeqtB3RMehUkd7v9YXgw4coX7dl.GBvTO')
    console.log(a)
}

t()
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pdGhhbjFAbmF2ZXIuY29tIiwiaWF0IjoxNjY0OTU3NjQ4LCJleHAiOjE2Njc1NDk2NDgsImlzcyI6ImFsYXJkaW4iLCJzdWIiOiIxIn0.cgcPSqzbsvO8E0MLI5AeiEKv7ubGIaXgIsbngcxahpo