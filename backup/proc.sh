#!/bin/sh


TOKEN="Bwo7Xnug9QMANwsEXnDKfUmrqry335zb"

cat $1 | while read LINE
do
	URL="http://api.map.baidu.com/geocoder/v2/?address=上海市$LINE地铁站&output=json&ak=$TOKEN"
	result=`curl $URL 2>/dev/null` ;
	lat=`echo $result | jq .result.location.lat `;
	lng=`echo $result | jq .result.location.lng` ;
	echo  "{\"name\":\"$LINE地铁站\", \"lat\":$lat, \"lng\":$lng},"
done