/* File: transit.js
 * Name: Aansh Kapadia
 * Date: 03/11/14
 * Assignment: 3
 * Summary: 
 * - Finds the User's current position and suggests closest T-station. 
 *	 Also lists the schedule of every train line, and its destination and arrival time.
 */

var map;
var center;
var color;
var myLat;
var myLng;
var myLocation;
var trainLine;
var furthest_dist_earth = 25000; //furthest dist between 2 points on earth (mi)

//The toRad function for calculating the closest dist (with haversine formula)
Number.prototype.toRad = function() {
        return this * Math.PI / 180;
}

//The Red Line has 22 stops
var RedLine = [
	["Alewife", 42.395428,-71.142483],
	["Davis",42.39674,-71.121815],
	["Porter Square",42.3884,-71.11914899999999],
	["Harvard Square",42.373362,-71.118956],
	["Central Square",42.365486,-71.103802],
	["Kendall/MIT",42.36249079,-71.08617653],
	["Charles/MGH",42.361166,-71.070628],
	["Park Street",42.35639457,-71.0624242],
	["Downtown Crossing",42.355518,-71.060225],
	["South Station",42.352271,-71.05524200000001],
	["Broadway",42.342622,-71.056967],
	["Andrew",42.330154,-71.057655],
	["JFK/UMass",42.320685,-71.052391],
	["North Quincy",42.275275,-71.029583],
	["Wollaston",42.2665139,-71.0203369],
	["Quincy Center",42.251809,-71.005409],
	["Quincy Adams",42.233391,-71.007153],
	["Braintree",42.2078543,-71.0011385],
	["Savin Hill",42.31129,-71.053331],
	["Fields Corner",42.300093,-71.061667],
	["Shawmut",42.29312583,-71.06573796000001],
	["Ashmont",42.284652,-71.06448899999999]
];

//The Blue Line has 12 stops
var BlueLine = [
	["Wonderland",42.41342,-70.991648],
	["Revere Beach",42.40784254,-70.99253321],
	["Beachmont",42.39754234,-70.99231944],
	["Suffolk Downs",42.39050067,-70.99712259],
	["Orient Heights",42.386867,-71.00473599999999],
	["Wood Island",42.3796403,-71.02286539000001],
	["Airport",42.374262,-71.030395],
	["Maverick",42.36911856,-71.03952958000001],
	["Aquarium",42.359784,-71.051652],
	["State Street",42.358978,-71.057598],
	["Government Center",42.359705,-71.05921499999999],
	["Bowdoin",42.361365,-71.062037]
];

//The Orange Line has 18 stops
var OrangeLine = [
	["Oak Grove",42.43668,-71.07109699999999],
	["Malden Center",42.426632,-71.07411],
	["Wellington",42.40237,-71.077082],
	["Sullivan",42.383975,-71.076994],
	["Community College",42.373622,-71.06953300000001],
	["North Station",42.365577,-71.06129],
	["Haymarket",42.363021,-71.05829],
	["State Street",42.358978,-71.057598],
	["Downtown Crossing",42.355518,-71.060225],
	["Chinatown",42.352547,-71.062752],
	["Tufts Medical",42.349662,-71.063917],
	["Mass Ave",42.341512,-71.083423],
	["Ruggles",42.336377,-71.088961],
	["Roxbury Crossing",42.331397,-71.095451],
	["Jackson Square",42.323132,-71.099592],
	["Stony Brook",42.317062,-71.104248],
	["Green Street",42.310525,-71.10741400000001],
	["Forest Hills",42.300523,-71.113686]
];

//Init function
function init()
{
	requestData();
}

//Requests information from online MBTA json file
function requestData()
{
	request = new XMLHttpRequest();
	request.open("GET", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);
	request.onreadystatechange = dataReady;
	request.send(null);
}

//Renders trains iff the correct readyState and request.status are present
function dataReady()
{
	if (request.readyState == 4 && request.status == 200)
	{
		init_map();
		scheduleData = JSON.parse(request.responseText);
		color = scheduleData["line"];
		if(color == "red") {
			trainLine = RedLine.slice(0);
			renderRedLine();
		} else if(color == "blue") {
			trainLine = BlueLine.slice(0);
			renderBlueLine();
		} else {			
			trainLine = OrangeLine.slice(0);
			renderOrangeLine();
		}
	}
	else if(request.readyState == 4 && request.status == 500)
	{
		init();//calls init re-requests data from mbta schedule if there is an error
	}
}

//Initalizes map
function init_map() 
{
	getMyLocation();
	var myOptions = {
		zoom: 13,
		center: new google.maps.LatLng(42.39674,-71.121815),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

//Gets myLat, myLng if geolocation is supported
function getMyLocation()
{
	if (navigator.geolocation){
  		navigator.geolocation.getCurrentPosition(function (position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            myLocation = new google.maps.LatLng(myLat, myLng)
            map.setCenter(myLocation);
            markMe();
        });
	} else {
		notSupported();
	}
}

//Alerts the user if GeoLocation is not supported
function notSupported() 
{
  alert("GeoLocation is not supported");
}

//Creates and places a new marker with information from myLocation
function markMe()
{
  	var marker = new google.maps.Marker({
      position: myLocation,
      map: map,
      title: "My Location"
  	});
  	var closest = find_closest_stop();
	var infowindow = new google.maps.InfoWindow();
	infowindow.setContent(
	  "I am here at (" + myLat + ", " + myLng + "). </br> I am approximately " + closest['dist'] +
	  	" miles from " + closest['t_stop'][0] + ", which is the closest T-Stop."
	);
	google.maps.event.addListener(marker, 'click', function() {
	    infowindow.open(map,marker);
	});
}

//Creates RedLine markers, infowindows, and red polyline.
function renderRedLine()
{
    for (var i = 0; i < RedLine.length; i++) {  
	       createMarker(RedLine, i);
    }

	var RedLineCoordinates = [];
	var RedLineCoordinates2 = [];
	for(var i = 0; i < RedLine.length-4; i++) {
		RedLineCoordinates.push(new google.maps.LatLng(RedLine[i][1], RedLine[i][2]));
	}
	RedLineCoordinates2.push(new google.maps.LatLng(RedLine[12][1], RedLine[12][2]));
	
	for(var i = RedLine.length-4; i < RedLine.length; i++) {
		RedLineCoordinates2.push(new google.maps.LatLng(RedLine[i][1], RedLine[i][2]));
	}
	createPolyline(RedLineCoordinates);
	createPolyline(RedLineCoordinates2);
}

//Creates BlueLine markers, infowindows, and blue polyline.
function renderBlueLine()
{
    for (var i = 0; i < BlueLine.length; i++) {  
    	createMarker(BlueLine, i);
    }
    
	var blueLineCoordinates = [];
	for(var i = 0; i < BlueLine.length; i++) {
		blueLineCoordinates.push(new google.maps.LatLng(BlueLine[i][1], BlueLine[i][2]));
	}
	createPolyline(blueLineCoordinates);
}

//Creates OrangeLine markers, infowindows, and orange polyline.
function renderOrangeLine()
{
    for (var i = 0; i < OrangeLine.length; i++) {  
    	createMarker(OrangeLine, i);
    }

	var orangeLineCoordinates = [];
	for(var i = 0; i < OrangeLine.length; i++) {
		orangeLineCoordinates.push(new google.maps.LatLng(OrangeLine[i][1], OrangeLine[i][2]));
	}
	createPolyline(orangeLineCoordinates);
}

//Takes in a trainArray and station and creates a marker using that station's 
// latitude and longitude
function createMarker(trainArray, station)
{
	if (color == "red"){
		img = "red_t.png";
	} else if (color == "blue"){
		img = "blue_t.png";
	} else if (color == "orange"){
		img = "orange_t.png";
	}

   	var marker = new google.maps.Marker({
   		position: new google.maps.LatLng(trainArray[station][1], trainArray[station][2]),
   		icon: img
  	});
  	marker.setMap(map);
  	infoWindow = new google.maps.InfoWindow();

	google.maps.event.addListener(marker, 'click', function() {
      		infoWindow.setContent(createTable(trainArray, station));
      		infoWindow.open(map, marker);
    });
}

//Takes in a trainArray and station_pos and creates the table/infowindow for that 
// station's marker
function createTable(trainArray, station_pos)
{
	var station = trainArray[station_pos][0];
	var infoTable = document.createElement("table");
    infoTable = "<div id='name'> Station: " + station;

    //sets up infoTable headers
    infoTable += "</div><table><tr><th>Line</th>"
    infoTable += "<th> ID </th><th> Arrives In </th><th> End Destination </th></tr>";

    //rest of t_stop information
    var data = scheduleData["schedule"];
    for (var i = 0; i < data.length; i++) {
        var t_stop = data[i]["Predictions"];
        for (var j = 0; j < t_stop.length; j++) {
            if (station == t_stop[j]["Stop"]) {
                minutes = Math.floor(t_stop[j]["Seconds"]/60);//gets total minutes
                seconds = (t_stop[j]["Seconds"] % 60);//gets minutes
                seconds = ("0" + seconds).slice(-2);
                infoTable += 
                	"<tr><td>" + scheduleData["line"] + "</td><td>"
                  	+ t_stop[j]["StopID"] + "</td><td> "
                  	+ minutes + ":" + seconds + "</td><td>"
                  	+ data[i]["Destination"] + "</td></tr>";
    	    }
	    }
    }           	
    infoTable += "</table>";                              	     
    return infoTable;
}

// Takes in an array of coordinates and creates a polyline connecting the line's 
// 	 markers based on the color of the train line.
function createPolyline(coordinates)
{
	polylineColor = color;
	if (color == "blue") { 
		polylineColor = "3399FF"; //nicer blue color to match PolyLine
	}
    var polyline = new google.maps.Polyline({
	    path: coordinates,
	    strokeColor: polylineColor,
	    strokeOpacity: 2.0,
	    strokeWeight: 3
  	});
    polyline.setMap(map);
}

//Loops through all the stations and calls the calc_dist function
// to figure out the closest T station to the user
function find_closest_stop()
{
	var temp_closest_stop = "";
	var temp_closest_dist = furthest_dist_earth;
	var station_name;
	var closest =  {"t_stop": temp_closest_stop, "dist": temp_closest_dist}; //will contain the info of the closest stop to users's location

	for (var i = 0; i < trainLine.length; i++) {
		station_name = trainLine[i];
		if (calculate_dist(station_name) < temp_closest_dist) {
			temp_closest_stop = station_name;//replace new closest t_stop
			temp_closest_dist = calculate_dist(station_name);//replace new closest dist
		}
	}
	closest["t_stop"] = temp_closest_stop;
	closest["dist"] = Math.round(temp_closest_dist);
	return closest;
}

//Calculates the distance between 2 pairs of latitudes/longitudes
//  http://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript 
function calculate_dist(station_name)
{
    var R = 6371; //earth's radius
    var km_to_miles = 0.621371; //miles in a kilometer

  	var tempLat = myLat - Number(station_name[1]);
    var d_lat = tempLat.toRad();
    var tempLng = myLng - Number(station_name[2]);
    var d_lng = tempLng.toRad();
    var lat1 = (Number(station_name[1])).toRad();
    var lat2 = myLat.toRad();
    
    //spherical law of cosines
    var a = Math.sin(d_lat/2) * Math.sin(d_lat/2) +
            Math.sin(d_lng/2) * Math.sin(d_lng/2) *
            Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));//angular distance in radians
    var distance = R * c;
    distance *= km_to_miles; // converts into miles
    return distance; //returns the distance (in miles)
}
