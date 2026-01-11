const Koa = require("koa");
const app = new Koa();
const onerror = require("koa-onerror");
const proxy = require("koa-better-http-proxy");

const PORT = 8929;

// error handler
onerror(app);

// 利用代理插件，实现代理服务
app.use(async (ctx, next) => {
  const { host, protocol } = ctx.request;
  await proxy(`${protocol}://${host}`, {
    limit: "50mb", // 提高请求体大小限制,避免Git提交中存在大文件时报错
    ...(protocol === "https"
      ? {
          https: true,
          preserveHostHdr: true,
        }
      : {}),
  })(ctx, next);
});

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

app.listen(PORT, () => {
  console.log(`==== 代理服务启动，端口: ${PORT}`);
});

module.exports = app;
