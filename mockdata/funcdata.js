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