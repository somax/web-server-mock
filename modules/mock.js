/**
 * [mock 模拟数据模块]
 * @type {Object}
 *
 * last modify 20150413 mxj
 */

var fs = require('fs'),
	url = require('url'),
	util = require('util'),
	mock = {};

mock.api = {
	test: 'hello!!'
};



mock.GET = function(_path) {
	// var data;

	//获取所有api
	if (/^\/api(\/|)$/.test(_path)) {

		return mock.apiList;

	} else {

		return getApiData(_path)
	}

	// return data;
}

mock.POST = function(_dataParts, newData) {
	return addDeep(this.api, _dataParts, newData);
}
mock.PUT = function(_dataParts, newData) {
	return modDeep(this.api, _dataParts, newData);
}
mock.DELETE = function(_dataParts) {
	return delDeep(this.api, _dataParts);
}

mock.readAPI = readAPI;



function getApiList() {
	var data = [];
	for (var k in mock.api) {
		data.push(k);
	}
	return data;
}

function getApiData(_path) {
	var key = _path.replace('/api/', '');
	var data = mock.api[key] || mock.api[key.split('/')[0]];


	// util.log('=-=-=-=-=-=-=isFunction: ',key,util.isFunction(data))
	return (util.isFunction(data)) ? data(_path) : data;
}

function getDeep(data, _dataParts) {
	try {
		for (var i = 0; i < _dataParts.length; i++) {
			data = data[_dataParts[i]];
		}
		return data;
	} catch (e) {
		console.log(_dataParts.join('/') + " is empty!")
		return null;
	}
}

function modDeep(data, _dataParts, newData) {
	var data = getDeep(data, _dataParts);
	if (data) {
		for (var k in newData) {
			data[k] = newData[k];
		}
	}
	return data;
}

function addDeep(data, _dataParts, newData) {
	var key, i = 0;
	for (; i < _dataParts.length - 1; i++) {
		key = _dataParts[i];
		if (!data.hasOwnProperty(key)) {
			data[key] = {};
		}
		data = data[key];
	}
	data[_dataParts[i]] = newData;
	return newData;
}

function delDeep(data, _dataParts) {
	var key, i = 0;
	try {
		for (; i < _dataParts.length - 1; i++) {
			key = _dataParts[i];
			if (data.hasOwnProperty(key)) {
				data = data[key];
			} else {
				return 404;
			}
		}
		if (!data.hasOwnProperty(_dataParts[i])) {
			return 404;
		}
		return delete data[_dataParts[i]];
	} catch (e) {


		console.log(_dataParts.join('/') + " not exist!")
		return false;
	}
}



/**
 * 读取模拟数据脚本，读取模拟数据
 * @param  {String} _apiPath 数据脚本所在路径
 */
function readAPI(_apiPath) {
	var _prefix = '(function(){';
	var _suffix = '})()'
	try {
		var files = fs.readdirSync(_apiPath);

		if (files.length) {
			files.forEach(function(fileName, index) {
				if (/(.js$)/.test(fileName)) {
					var _file = _apiPath + fileName;

					var _content = fs.readFileSync(_file);
					try {
						var _js = _content.toString();

							// todo 兼容未加 _prefix 的情况
						if(!/^\(function/.test(_js))
							_js = _prefix + _js + _suffix;
						var _api = eval(_js);
						// 合并到 mock.api对象上
						for (var k in _api) {
							mock.api[k] = _api[k];
						}
						console.log(_file, _api);
					} catch (err) {
						console.log('Parse API Error: ', _file, err)
					}

				}
			});

			// 生成API清单
			mock.apiList = getApiList();

		}
	} catch (err) {
		console.log('if need mockdata, put *.js file in ' + _apiPath + '!');
	}



}

mock.getApiList = getApiList;



module.exports = mock;