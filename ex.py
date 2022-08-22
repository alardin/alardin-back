from turtle import pos
from requests import *

url = "http://5thdegree.sstf.site/chal"

data = {
    'min[0]': 123,
    'max': 123
}

r = post(url, data=data)

print (r.text)