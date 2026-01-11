const path = require("path");
const Koa = require("koa");
const app = new Koa();
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const render = require("koa-ejs");
const server = require("koa-static");

const index = require("./routes/index");
const { TO_DECODE_PATH } = require("./config/index");

const PORT = 3000;

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());

// 页面静态资源
app.use(server(path.join(__dirname, "public"), {}));

app.use(logger());

// 处理解密文件的静态资源
app.use(server(TO_DECODE_PATH));

// 页面处理模板中间件
render(app, {
  root: path.join(__dirname, "views"),
  layout: false,
  viewExt: "html",
  cache: false,
  debug: false,
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`接口,处理完毕 ${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

app.listen(PORT, () => {
  console.log(`==== 文件服务启动，端口: ${PORT}`);
});

module.exports = app;
