#!/usr/bin/env node

const net = require("net");

/*
 * 请求测试
 * 测试获取一个加密的请求数据，查看TCP响应内容(HTTP包原始内容)
 */

const options = {
  port: 8929,
  host: "192.168.101.212",
};

const socket = net.connect(options, () => {
  const request = [
    "GET / HTTP/1.1",
    "Host: 192.168.101.212",
    "Connection: close",
    "",
    "",
  ].join("\r\n");
  // 建立连接成功后发起http请求
  socket.write(request);
});

let rawChunk = Buffer.from(new Uint8Array(0));

socket.on("data", (chunk) => {
  rawChunk = Buffer.concat([rawChunk, chunk])
});

socket.on("end", () => {
  // 整个原始的 HTTP 包的内容
  console.log(rawChunk.toString());
});
