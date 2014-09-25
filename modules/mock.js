/**
 * [mock 模拟数据模块]
 * @type {Object}
 */

var fs = require('fs'),
	mock = {};

mock.api = {
	test: 'hello!!'
};
mock.GET = function(_dataParts) {
	return getDeep(this.api, _dataParts);
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
	return data;
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

var mockdataPath = './mockdata/api.json';
fs.readFile(mockdataPath, function(err, data) {
	if (err) {
		console.log('readFileError:', err.path);
		return;
	}
	try{
		data = JSON.parse(data);
		console.log(data);
		mock.api = data;	
	}catch(err){
		console.log('parseError: ',mockdataPath,err)
		return;
	}

});



module.exports = mock;