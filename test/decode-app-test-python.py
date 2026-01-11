import httplib
# 检查Python发起的请求获取的加密响应是否会被自动decode

conn = httplib.HTTPConnection("192.168.101.212:8929")
# conn = httplib.HTTPConnection("www.example.com")
conn.request("GET", "/")

res = conn.getresponse()
data = res.read()

print(data)