var http = require('http') ;
var fs = require('fs') ;
var line_reader = require('readline') ;
require('./js/line.js') ;

// console.log(JSON.stringify(process.argv)) ;

var src_station = "顾戴路" ;
var dest_station = "虹梅路" ;

//console.log(g_line) ;

function get_station_pos(name) {
	for (var i = 1; i < g_line.length; i++) {	
		if (g_line[i] == undefined) continue ;

		for (var j = 0; j < g_line[i].length; j++) {
			var stations = g_line[i][j].stations ;
			
			for(var k = 0; k<stations.length; k++) {
				if (name == stations[k].name)
					return stations[k].position ;
			}
		};
	};

	console.log("Can't find " + name) ;
}

var src_point = get_station_pos(src_station) ;
var dest_point = get_station_pos(dest_station) ;

if (src_point == undefined || dest_point == undefined)  
	process.exit(0) ;

var src = String(src_point.lat) + ',' + String(src_point.lng) ;
var dest = String(dest_point.lat) + ',' + String(dest_point.lng) ;

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

var lr = line_reader.createInterface( {input: require('fs').createReadStream('card.txt')} ) ;
lr.on('line', function(line) {
	console.log('Line from file', line) ;
})



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