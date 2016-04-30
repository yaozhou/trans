var http = require('http') ;
var fs = require('fs') ;
var line_reader = require('readline') ;
var stream = require('stream') ;
require('./js/line.js') ;

// console.log(JSON.stringify(process.argv)) ;

var src_station = "顾戴路" ;
var dest_station = "虹梅路" ;



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

function request_callback(src, dest, response) {
	var str = '' ;
	response.on('data', function (chunk) {
		str += chunk ;
	}) ;

	response.on('end', function() {
		//console.log("src:" + src + " dest:" + dest) ;
		proc_result(str) ;
	})
}

function proc_result(str) {
	var result = JSON.parse(str) ;
	var steps = result.result.routes[0].scheme[0].steps ;

	var route = "" ;
	for (var i = 0; i < steps.length; i++) {
		var step = steps[i][0] ;
		if (step.type != 3) continue ;

		var vehicle = step.vehicle ;
		if (route.length > 0) route += "," ;

		var s = vehicle.start_name ;
		if (s != "上海火车站")
		 	s = s.substr(0, s.length - 1) ;
		var e = vehicle.end_name ;
		if (e != "山海火车站")
			e = e.substr(0, e.length - 1) ;
		// route += vehicle.name + "," + vehicle.start_name + "," + vehicle.start_uid + "," + 
		// 		vehicle.end_name + "," + vehicle.end_uid ;
		route += vehicle.name + "," + s + "," + e ;
	};
	console.log(route) ;
}

function calculate(a, b) {
	var src_point = get_station_pos(a) ;
	var dest_point = get_station_pos(b) ;

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

	var req = http.request(options, request_callback.bind(null, a, b)).end() ;
}


function calculate_road() {
	var instream = fs.createReadStream('./card.txt') ;
	var outstream = new stream ;
	var lr = line_reader.createInterface( instream, outstream ) ;
	var g_last ;
	lr.on('line', function(line) {
		if (line == undefined) return ;
		//console.log('Line from file', line) ;
		var ary = line.split(',') ;
		if (g_last == undefined) {
			g_last = ary ;
			return ;
		}else{
			if (ary[0] == g_last[0]) {
				var a = g_last[3].substr(g_last[3].indexOf('号线') + 2).trim() ;
				var b = ary[3].substr(ary[3].indexOf('号线') + 2).trim() ;
				if (a == b) {
					g_last = ary ;
				}else {
					calculate(a, b) ;
					g_last = undefined ;
				}			
			}else {
				g_last = ary ;
			}
		}
	})	
}


function get_station_idx(stations, name) {
	for (var i = 0; i < stations.length; i++) {
		if (stations[i].name == name) {
			return i ;
		}
	};
	return -1 ;
}



function get_stations(line, a, b) {
	var list = [] ;
	for (var i = 0; i < g_line[line].length; i++) {
		var stations = g_line[line][i].stations ;
		var idx_a = get_station_idx(stations, a) ;
		var idx_b = get_station_idx(stations, b) ;
		if (idx_a < 0 || idx_b < 0) continue ;

		if ( idx_a < idx_b) {
			for(var i = idx_a; i<=idx_b; ++i){
				list.push(stations[i].id) ;
			}
		}else{
			for(var i=idx_a; i>=idx_b; --i) {
				list.push(stations[i].id) ;
			}
		}
		
		return list ;
	};

	console.log("Can't find line:" + line + " start:" + a + " end:" + b) ;
	process.exit(0) ;
}


var g_road_line = [] ;

function calculate_client_line() {
	var instream = fs.createReadStream('./road') ;
	var outstream = new stream ;
	var lr = line_reader.createInterface( instream, outstream ) ;
	lr.on('line', function(line) {
		var ary = line.split(',') ;
		var result = [] ;
		for (var i = 0; i < ary.length; i+=3) {
			var line = ary[i+0] ;
			line = line.replace("地铁", "") ;
			line = line.replace("号线", "") ;
			var start = ary[i+1] ;
			var end = ary[i+2] ;
			//console.log("line:" + line + " start:" + start + " end:" + end) ;
			var r = get_stations(parseInt(line), start, end) ;
			result = result.concat(r) ;
		};
		g_road_line.push(result) ;
	})	

	lr.on('end', function() {
		console.log("end") ;
	})

	lr.on('close', function(){
		console.log(g_road_line) ;
	})
}


