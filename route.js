var http = require('http') ;
var fs = require('fs') ;

// console.log(JSON.stringify(process.argv)) ;

var src = "徐家汇地铁站" ;
var dest = "汶水路地铁站" ;


var query_str = '/direction/v1?mode=transit&origin=' + 
				src + '&destination=' + dest + 
				'&region=上海&output=json&ak=Bwo7Xnug9QMANwsEXnDKfUmrqry335zb'
var options = {
	host : 'api.map.baidu.com',
	path : query_str,
} ;

function callback(response) {
	var str = '' ;
	response.on('data', function (chunk) {
		str += chunk ;
	}) ;

	response.on('end', function() {
		proc_result(str) ;
	})
}

function proc_result(str) {
	var result = JSON.parse(str) ;
	var steps = result.result.routes[0].scheme[0].steps ;

	

	for (var i = 0; i < steps.length; i++) {
		var step = steps[i][0] ;
		if (step.type != 3) continue ;

		var vehicle = step.vehicle ;
		console.log("name:" + vehicle.name) ;
		console.log("start:" + vehicle.start_name) ;
		console.log("end:" + vehicle.end_name) ;
	};


}


var req = http.request(options, callback).end() ;