(function(){
	var _api = {
		foo: "bar",
		users: [{name:'moss'},{name:'jhon'}],
		newv:12345
	}

	function getBy(_getKey,_byKey,_value){
		var _datas = _api[_getKey],
			_results = [];

		for(var i=0;i<_datas.length;i++){
			var _data = _datas[i];
			if(_data[_byKey]==_value){
				_results.push(_data);
			}
		}
		return _results;
	}

	_api['foo?name=moss']=getBy('users','name','mosses');

	return _api;

})()