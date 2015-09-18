var _list = [{id:'abc',value:'ABC'},{id:'efg',value:'EFG'}]
var _api = {
	list: query,
	"list/abc?query":"list-abc?query"
}
function query(url) {

	// 预处理url
	// 获得键名

	url = url.replace(/^\/api\//, '')

	var isMainKey = /^list$|^list\/$/.test(url);

	if ( !isMainKey && _api.hasOwnProperty(url)) {
		return _api[url];
	}

	var keys = url.split('/');

	// 获得查询条件
	var condition = makeCondition(url);

	// 返回数据
	if (isMainKey) {

		if (JSON.stringify(condition) === '{}') {
			return _list;
		}
		return filter(condition);
	} else {
		return filter({
			'id': keys[1]
		})
	}

	return null;
}

function makeCondition(url) {
	// 获得查询条件
	var query = url.match(/[^(?|&|=|#)]+/g);
	query.shift();
	var condition = {}
	for (var i = 0; i < query.length; i++) {
		condition[query[i]] = query[++i];
	};
	return condition;
}

function isInCondition(item, condition) {
	console.log(item, condition)
	for (var key in condition) {
		if (item[key] === condition[key]) {
			return true;
		}
	}
	return false;
}

function filter(condition, isList) {
	var _result = [];
	for (var i = 0, len = _list.length; i < len; i++) {
		var item = _list[i];
		var _test = false;
		var _isIn = isInCondition(item, condition)

		if (_isIn) {

			if (isList) {
				_result.push(item)
			} else {
				return item;
			}
		}
	};
	return _result;
}


return _api;