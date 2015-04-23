# WEB SERVER MOCK
 
此项目在Web-server.js的基础上，增加模拟restful api的支持，提供前端开发的模拟数据支撑。

>Web-server.js 是之前github找到的一个项目中携带的，现在忘记出处了，在这里感谢原作者。

### 安装方式：

>本项目依赖 [nodejs](http://nodejs.org/)，请先安装 

**安装到全局：**

`$ npm install -g web-server-mock`


### 使用方法：

>在项目目录下:
使用 `$ wsm` 或者 `$ wsm 8000` 指定端口号，启动服务。

>将 `./mockdata/api.js` 复制到项目目录，修改其中测试数据。你可以在目录中添加多个*.js文件


### 模拟数据范例

```js

(function(){
	var _list = [{id:'abc',value:'ABC'},{id:'efg',value:'EFG'}]
	var _api = {
		list: query
	}

	function query(url){
		var params = url.replace('/api/list','').split('/');

		if(params.length == 1 )
			return _list;

		for (var i = 0,len = _list.length; i < len; i++) {
			var item = _list[i];
			if(item.id === params[1]){
				return item;
			}
		};

		return null;
	}

	return _api;

})()
```