# WEB SERVER MOCK
 
此项目在Web-server.js的基础上，增加模拟restful api的支持，提供前端开发的模拟数据支撑。

>Web-server.js 是之前github找到的一个项目中携带的，现在忘记出处了，在这里感谢原作者。

###安装方式：

>本项目依赖 [nodejs](http://nodejs.org/)，请先安装 

**安装到全局：**

`$ npm install -g web-server-mock`


>**setup:**
> osx: `$ ~/npm/lib/node_modules/web-server-mock/bin/setup`
>windows: `%userprofile%\AppData\Roaming\npm\node_modules\web-server-mock\bin\setup`

**手动建立快捷方式(可选)**

> 如果 执行上述 setup 没有成功，可进行一下手动配置

>OSX 10.x: 
>	`$ ln ~/npm/lib/node_modules/web-server-mock/bin/wsm.sh ~/npm/bin/wsm`

>WINDOWS 8.x: 
>将 bin 目录下的 wsm.cmd 复制到  `%userprofile%\AppData\Roaming\npm\`目录下面


###使用方法：

>在项目目录下:
使用 `$ wsm` 或者 `$ wsm 8000` 指定端口号，启动服务。

