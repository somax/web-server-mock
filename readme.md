# WEB SERVER MOCK
 
此项目在Web-server.js的基础上，增加模拟restful api的支持，提供前端开发的模拟数据支撑。

>Web-server.js 是之前github找到的一个项目中携带的，现在忘记出处了，在这里感谢原作者。

###安装方式

>需要先安装 nodejs

**在项目中安装：**
进入项目目录，然后
`npm install web-server-mock` 

**或者安装到全局：**
`npm install -g web-server-mock`

###使用方法：
启动安装在项目目录中的web服务:
`node ./web-server-mock`

或者在任何目录下面启动web服务:
`node ~/npm/lib/node_modules/web-server-mock/web-server-mock.js`

使用别名：
`alias wsm='node ~/npm/lib/node_modules/web-server-mock/web-server-mock.js' `
然后就可以在任何目录下，使用 `wsm` 来启动服务。