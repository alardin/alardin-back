keyword = "chick_duck"
r = []

for i in range(10):
    r.append(f"https://alardin-static.s3.ap-northeast-2.amazonaws.com/images/{keyword}/{keyword}{i}.jpg")
    
print (str(r).replace("'", '"'))