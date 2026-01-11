> - e-safenet：亿赛通

# e-safenet 的文件解密工具

在安装了`e-safenet`且处于`密文模式`下的机器上，运行本项目代码。通过本项目启动的文件资源服务，利用网络获取此机器上的加密文件，可得到解密后的文件，以此达到解密文件的效果。

## 解密原理介绍

1. e-safenet 这套软件，需要保证被其加密的机器上的软件能正常运行，则 e-safenet 加密过程对软件来说是透明(无感)的。
2. 开发软件工具等在使用过程中必定要保证能够正常读写文件，则软件所读到（获取）的必定是没有加密正常的文件，也就是说过程中 e-safenet 已将文件悄悄解密。
3. 软件将读取的正常（decode 后的）文件通过网络发送出去，即可得到一份正常的没被加密的文件。

此项目利用该性质，采用 `node` / `nginx` 来正常读取被加密的文件，并将文件通过网络发送。

### 关于 e-safenet

据推测，e-safenet 加密作用于文件驱动层，软件层在其之上，相关原理推测如下图：
![文件加密机制](./public/images/%E5%8A%A0%E5%AF%86%E6%9C%BA%E5%88%B6-%E6%96%87%E4%BB%B6.jpg)

e-safenet 软件方也能灵活配置加密策略，全文内容仅为猜想所得大致结论。

### 关于软件名单

e-safenet 维护了一套软件名单（由公司管控），在安装了 e-safenet 且处于密文模式的机器上，这些软件可正常读写被加密后的文件。

推测软件名单有：

- vscode、idea、notepad++等代码编辑和开发工具
- node、Java、Tomcat 等代码运行程序
- WPS 等文档软件
- Chrome 浏览器等
- 一些 windows 系统文件功能
  > 对于 Windows 资源管理器，其所处位置不明，因为资源管理器移动或重命名，不会操作文件具体二进制内容，只是操作文件整体，似乎不会导致文件加密

软件名单采用白名单，不处于白名单中的软件，软件的读写操作并不经过 e-safenet 处理

- 读加密文件时，只能获取到文件本身被加密后呈现的乱码，读文件过程 e-safenet 不帮忙解密
- 写文件时，永远不会被 e-safenet 加密

### 关于文件格式名单

推测 e-safenet 还维护了一套文件格式名单（同样由公司管控），对于特定文件格式，上述软件名单中的程序在对其进行写操作时，必定会触发将文件进行加密。

对于非名单中的格式，e-safenet 并不会对其进行加密或解密

推测文件格式名单有：

- docx、Excel 等办公文档文件
- js、java 等代码文件
- 许可文件等 company 重要文件

## 工具实现方案

> 【虚拟器巧用（针对 Windows 宿主机）】
>
> 1. 可以在宿主系统上建个文件夹，并通过网络进行共享（SMB）；
> 2. 在虚拟机中将这个网络共享文件夹位置挂载为一个分区；
> 3. 指定解密工具启动的静态资源服务，使用这个分区位置；
> 4. 之后宿主机若是接收到加密的文件，可直接将文件移动到此文件夹后，之后就能在虚拟机启动的 web 页面看到最新文件
> 5. 点击直接下载即可，用完直接删除，都是直接在宿主机上操作文件，不用麻烦地将文件复制到虚拟机中。

### Node.js 实现方案

#### 项目技术

项目基于 NodeJS，用 koa 框架简单搭建快速成型。

NodeJS 版本等均无特定要求。

#### 项目核心依赖库

- `koa-static` 静态资源服务插件，用于读取文件并通过网络传输
- `koa-ejs` 服务端渲染用的模板工具，用于编写和生成目录页面
- `koa-router` 匹配用户访问的路径，用于渲染页面

#### 运行说明

- **项目必须运行在安装了 e-safenet 加密环境，并处于密文模式的机器上。**
- 可在`config/index.js` 中配置`koa-static`要读取的目录
- 项目启动端口默认 3000

#### 项目启动命令

- `yarn start` 运行项目
- `yarn dev` 开发模式运行项目，是热部署的

### Nginx 实现方案

步骤说明：

1. 下载一个 Windows 版本 Nginx，从官网下载任意压缩包版本解压就行
2. 重命名其中的 nginx.exe 为可执行程序为解密软件名单中的程序，比如 node.exe、java.exe 等，这里使用 chrome.exe（方便与下面的 http 解密代理使用一个进程）
3. 修改 nginx 配置添加一个新的 sever，用 root 指定静态资源目录，并开启 autoindex 功能，自动生成文件目录 web 页。简要配置如下：

   ```conf
   server {
       listen 3000; # 端口可自定义
       server_name localhost;

       charset utf-8; # 注意字符集，否则文件目录中的中文可能乱码

       location / {
         root Z:/_Tmp/todoFile/; # 指定要浏览和解密的目录路径（注意Windows下路径分隔符用'/'即可）

         autoindex on; # 启用目录浏览
         autoindex_exact_size off; # 是否显示精确bite大小，off则使用合适的单位显示大小
         autoindex_localtime on; # 是否使用本地时间显示文件修改日期
       }

     }
   ```

4. 启动 nginx 即可，由于重命名了执行程序名字，启动名也相应改下。 `chrome.exe` 或者 `chrome.exe -c .\conf\nginx.conf`

#### 运行说明

与 Node.js 同样，也是运行在安装了 e-safenet 加密环境，并处于密文模式的机器上。

# e-safenet 的 http 解密代理工具

## 解密原理介绍

经初步了解，e-safenet 服务商提供了对 `SVN` / `gitlab` 的网络通信数据上加密支持。当 SVN/gitlab 服务端也安装了服务商提供的软件并开启了加密后，客户端若是想要正常访问 SVN/gitlab，电脑也必须处于安装了 e-safenet 的加密环境中。

故 e-safenet 除了在文件驱动层上有作用，在网络层上也确实会起作用，能够实现：

- 对指定软件的出口数据包做加密。

  例如 Git、SVN 服务器配置了加密后，服务器发出的响应报文中的 http 响应数据被加密（猜测处理在网络模型的应用层上，此策略不会加密整个 TCP 流，只会处理 http 包体）。

- 对`指定软件`接收到的响应数据包做解密。

  例如浏览器、svn 客户端、Git 客户端，未安装 e-safenet 的机器上，若这些软件接收到的服务器返回数据包是加密的，则不能都正常识别，会报 http 数据包错误；安装了 e-safenet 则可正常使用。

  不在指定名单内的软件，若是接收到服务器返回的数据包是加密的，无论如何都识别不了。

  > 这个名单变动大，曾经一段时间，像 node、nginx 这类软件都是名单内的，现在已经被移除了。最新的新版本亿赛通调整了策略，可能只会对浏览器软件接收的 HTTP 包做解密，node 不在策略名单中，不会自动解密其接收的 HTTP 包（本人账户测试）

原先 node 在名单内时，可以通过此工具（项目）在加密机器上用 node 启动一个代理服务。当未安装 e-safenet 的机器上，在需要访问加密 Git 时，通过配置网络代理，将其 `浏览器的Git页面请求`或 `git客户端请求`，经过这个代理服务进行访问，即可得到解密后的响应。

e-safenet 策略更新后，node 被移除名单中，原方法无法生效。但经过分析，得到一突破点：<span style="color: red">e-safenet 识别软件进程，是直接通过 exe 软件的名称进行识别的！</span>

意味着只需要将 node 程序的名字改为名单中已知的“chrome.exe”等，即可变相的进入解密名单，从而使 node 做解密代理的方案再次可行。

e-safenet 原理过程图示如下：

![http加密机制](./public/images/%E5%8A%A0%E5%AF%86%E6%9C%BA%E5%88%B6-http%E8%AF%B7%E6%B1%82.jpg)

## 客户端使用方法介绍

服务端代理服务启动后，在访问端(未加密电脑)上配置网络代理，代理到这个服务端的代理服务上。

各中客户端（访问端）配置方法如下：

### 1. 浏览器

配置代理，将目标的网址都代理到这个机器服务上。有许多方法，达成目的即可：

- 用系统自带代理功能或第三方代理客户端，控制将目标地址(例如 gitlab 地址)的请求代理到这个机器。
- 给浏览器安装代理插件，方便地控制浏览器页面的代理。

例如：给浏览器安装`Proxy SwitchyOmega` 或者 `SmartProxy`这款插件，指定 gitlab 的网址走这个机器代理。

> 推荐 `SmartProxy`，似乎其使用了浏览器较新的 API 进行开发的。但是 `Proxy SwitchyOmega` 也相对比较知名。

![代理机器配置举例](./public/images/%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE.png)
![代理规则配置举例](./public/images/%E4%BB%A3%E7%90%86%E6%8F%92%E4%BB%B6%E8%A7%84%E5%88%99%E9%85%8D%E7%BD%AE.png)

### 2. git 客户端

> git 推荐直接用 ssh 协议克隆和使用项目，由于不走 http 协议，这种使用方式并不会被加密
>
> 可以避免繁琐的代理操作

在普通电脑上克隆项目时，需要设置终端环境变量的`HTTP_PROXY`为代理服务地址，才能正常克隆

```cmd
set HTTP_PROXY=http://192.168.13.218:8929

rem company的Gitlab是http的，这个https的配置没啥用
set HTTPS_PROXY=http://192.168.13.218:8929
```

克隆完之后的后续使用，需编辑项目的 Git 配置，添加代理配置，代理目标为这个机器服务。

```sh
### 配置举例
# 在项目下运行配置命令，以针对项目配置代理
# 也可考虑加 --global 改全局配置
git config http.proxy http://192.168.13.218:8929
# company的Gitlab是http的，https的配置没啥用
git config https.proxy http://192.168.13.218:8929
```

### 3. SVN 客户端

SVN 与 gitlab 同理，通过此代理服务，可将 svn 与服务器通信过程中涉及到的加密过的 http 响应内容进行解密。

使用方法：

- 若是只是通过浏览器访问 svn，同上方浏览器配置，添加一条规则，将 svn 路径也代理到该服务即可；
- svn 客户端，通过在 svn 网络设置中，配置代理服务器即可
  ![svn代理设置](./public/images/svn%E8%AE%BE%E7%BD%AE%E4%BB%A3%E7%90%86.png)

> 备注：由于 svn 客户端在使用过程中还涉及 svn 协议，代理仅实现了 HTTP 的代理转发，未能实现 TCP 流的代理，因此使用过程中可能存在未知的问题，有待发现。

## 代理工具实现方案

### Node.js 实现方案

#### 代码介绍

整个代理功能文件只有一个，就是 `app-proxy.js`。

只是用 `koa` + `proxy插件`，实现的一个代理服务，将请求转发到目标服务器地址上，作用极为简单。

#### 运行说明

必要条件：

- 项目必须运行在安装了 e-safenet 加密环境，并处于密文模式的机器上。
- 需要使 e-safenet 的策略规则会对 node 的响应 HTTP 包做解密。

  > 最新发现，新版本 e-safenet 改了策略规则，node 请求的加密 HTTP 包，e-safenet 可能不会自动解密，故直接通过 node 运行，功能无法生效，需将 node 复制重命名为 chrome，以使其生效。

- 检查 node 进程的接收的响应是否会被解密，可通过执行 test 目录中的测试代码来检查

  ```sh
  # 检查node接收的响应是否会被解密
  node test/esafenet-http-decode-test.js

  # 检查重命名后的node接收的响应是否会被解密
  chrome test/esafenet-http-decode-test.js
  ```

操作步骤：

1. 在安装了 e-safenet 的机器上安装好 node 后（推荐 zip 方式手动安装），此时 node 可执行程序路径应该已加入系统环境变量了（或者自己手动添加），进入到 node 可执行所在位置，将`node.exe`复制一份在原位置下，重命名为`chrome.exe`
   ![复制node重命名为chrome](./public/images/%E5%A4%8D%E5%88%B6node%E9%87%8D%E5%91%BD%E5%90%8D%E4%B8%BAchrome.png)

2. 运行此代理服务，运行方式见下方的启动命令（注意 package.json 中已经修改使用 chrome 程序执行脚本而不是 node）

#### 启动命令

- `yarn start-proxy` 运行代理功能
- `yarn dev-proxy` 开发模式运行项目，是热部署的

可以自定义配置服务端口，默认端口 8929，启动命令实际运行`app-proxy.js`这个文件，这里面可配端口号

### Nginx 实现方案

> 与前章节中文件解密服务是一样的，前者是启动一个带有自动目录 web 功能静态资源服务，这里是启动一个代理服务实现正向代理功能。两个功能用同一个 Nginx 程序即可。完整的配置文件见 [nginx 配置文件](./nginx-scheme/nginx.conf)，`nginx-scheme`目录下也提供了一个已经重命名好的 nginx 安装包，可自行修改和替换里面的配置

步骤说明：

1. 下载一个 Windows 版本 Nginx，从官网下载任意压缩包版本解压就行
2. 重命名其中的 nginx.exe 为可执行程序为解密软件名单中的程序，比如 git.exe、svn.exe 等，这里使用 chrome.exe
3. 修改 nginx 配置添加一个新的 sever，配置实现正向代理功能。简要配置如下：

   ```conf
   server {
    listen 8929; # 正向代理监听的端口
    location / {
      proxy_pass http://$http_host$request_uri; # 将请求转发到目标服务器和地址
      proxy_set_header Host $http_host; # 修改Host头位目标Host

      proxy_connect_timeout 5s; # 连接超时时间
      proxy_read_timeout 15m; # 等待响应数据的超时时间
      proxy_send_timeout 1m; # 发送请求数据的超时时间
    }
   }
   ```

4. 启动 nginx 即可，由于重命名了执行程序名字，启动名也相应改下。 `chrome.exe` 或者 `chrome.exe -c .\conf\nginx.conf`

#### 运行说明

与 Node.js 同样，也是运行在安装了 e-safenet 加密环境，并处于密文模式的机器上。
