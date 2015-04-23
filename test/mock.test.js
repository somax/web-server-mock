var mock = require('../modules/mock');
	mock.readAPI('./mockdata/');

function isSameValue(obj1,obj2){
	var _val1 =JSON.stringify(obj1);
	var _val2 = JSON.stringify(obj2);
	return _val1 === _val2;
}
function expect(msg,val,be){
	console.log('\n[ expect '+ msg+']')

	console.log('  TO BE',be,'IS',isSameValue(val,be));
}
expect('GET test',mock.GET('/api/test'), 'hello!!');
expect('GET foo',mock.GET('/api/foo'), 'bar');
expect('GET exp',mock.GET('/api/exp'), 'new 2222!!!');
expect('GET query abc',mock.GET('/api/list/abc'),{id:'abc',value:'ABC'});
expect('GET query',mock.GET('/api/list'),[{id:'abc',value:'ABC'},{id:'efg',value:'EFG'}]);

// console.log('apiList: ',mock.apiList);
// console.log('apiList: ',mock.getApiList());
// 
// 
// 
