const router = require("koa-router")();
const fs = require("fs");
const path = require("path");
const { TO_DECODE_PATH } = require("../config/index");

router.get(/^\/.*$/, async (ctx, next) => {
  const relativePath = decodeURIComponent(ctx.request.path);
  const readPath = path.join(TO_DECODE_PATH, relativePath);
  // 安全性校验
  if (!readPath.includes(TO_DECODE_PATH) || relativePath.includes("..")) {
    ctx.throw(403, "Forbidden: 不可访问", { user: user });
    console.error("非法访问!!!", TO_DECODE_PATH, relativePath);
    return;
  }

  if (fs.existsSync(readPath)) {
    const folderStat = fs.statSync(readPath);
    if (folderStat.isDirectory()) {
      let fileNameList = fs.readdirSync(readPath).map((name) => name.trim());
      const fileList = fileNameList.map((fileName) => {
        const stats = fs.statSync(path.join(readPath, fileName));
        if (stats.isFile()) {
          return {
            name: fileName,
            path: "./" + encodeURIComponent(fileName),
            isFile: true,
          };
        } else {
          return {
            name: fileName + "/",
            path: "./" + encodeURIComponent(fileName) + "/",
            isFile: false,
          };
        }
      });
      // 加入上一级路径
      if (readPath !== TO_DECODE_PATH) {
        fileList.unshift({
          name: "..返回上一级",
          path: "../",
          isFile: false,
        });
      }
      await ctx.render("index", {
        fileList,
      });
      return;
    } else if (folderStat.isFile()) {
      return;
    }
  }
  console.warn("目录或文件不存在:", readPath);
});

module.exports = router;
