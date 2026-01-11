#!/usr/bin/env node

const http = require("http");

/*
 * 请求测试
 * 测试获取一个加密的请求数据，若发送报错，http响应被加密
 * 则说明e-safenet不会自动将该node进程的请求响应进行解密，代理解密功能无法生效
 */
const options = {
  hostname: "192.168.101.212",
  port: 8929,
  path: "/",
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);

  res.setEncoding("utf8");
  let rawData = "";

  res.on("data", (chunk) => {
    rawData += chunk;
  });

  res.on("end", () => {
    console.log(`【✔️】响应中的数据: ${rawData}`);
  });
});

req.on("error", (error) => {
  console.error(`【❌】请求遇到问题: ${error.message}`);
  const rawChunk = error.rawPacket;
  console.log(
    "http包内容:\n",
    (rawChunk.toString && rawChunk.toString("latin1")) || rawChunk
  );
});

req.end();
