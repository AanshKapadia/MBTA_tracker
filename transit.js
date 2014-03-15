/* Name: Aansh Kapadia
 * Assignment: 3
 * Date: 03/11/14
 * What it does: 
 * 	- Finds the User's current position and suggests closest T-station. 
 *	  Also lists the schedule of every train, its destination and arrival time.
 */

var map;
var center;
var color;
var myLat;
var myLng;
var myLocation;

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

function init()
{
	getMyLocation();
	var myOptions = {
		zoom: 13,
		center: new google.maps.LatLng(42.39674,-71.121815),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getData();
}

function getMyLocation()
{
	if (navigator.geolocation){
  		navigator.geolocation.getCurrentPosition(function (position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            myLocation = new google.maps.LatLng(myLat, myLng)
            // map.panTo(myLocation);
            markMe();
        });
	} else {
		notSupported();
	}
}

function notSupported() 
{
  alert("GeoLocation is not supported");
}

function markMe()
{
  	var marker = new google.maps.Marker({
      position: myLocation,
      map: map,
      title: "My Location"
  	});

	var infowindow = new google.maps.InfoWindow();
	infowindow.setContent(
	  "I am here at " + myLat + ", " + myLng + "."
	);

	google.maps.event.addListener(marker, 'click', function() {
	    infowindow.open(map,marker);
	});
	google.maps.event.addDomListener(window, 'load', init);
}

function getData()
{
	request = new XMLHttpRequest();
	request.open("GET", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);
	request.onreadystatechange = dataReady;
	request.send(null);
}

function dataReady()
{
	if (request.readyState == 4 && request.status == 200)
	{
		scheduleData = JSON.parse(request.responseText);
		color = scheduleData["line"];
		console.log(scheduleData);
		if(color == "red") {
			renderRedLine();
		} else if(color == "blue") {
			renderBlueLine();
		} else {
			renderOrangeLine();
		}
	}
	else if(request.readyState == 4 && request.status == 500)
	{
		getData();//re-requests data from mbta schedule if there is an error
	}
}

function renderRedLine()
{
    for (var i = 0; i < RedLine.length; i++) {  

    	var station;
    	var destination;
    	var contentString = "Stop: " + RedLine[i][0] +
    	  '<div id="content">'+
	      '<div id="info">'+
	      '<p>'+
		      '<table>' +
  		// 		'<tr>' +
				//   '<td>' + "Station Name" + '</td>' +
				//   // '<td>' + "Arrival Schedule" + '</td>' +
				//   // '<td>' + "Destination Direction" + '</td>' +
				// '</tr>' +
				'<tr>' +
				  '<td>' + RedLine[i][1] + '</td>' +
				'</tr>' +
				'<tr>' +
				  '<td>' + RedLine[i][2] + '</td>' +
				'</tr>' +
				// <tr>
				//   <td>Eve</td>
				//   <td>Jackson</td> 
				//   <td>94</td>
				// </tr>
				'</table>'+
			'</p>'+
	      '</div>'+
	       '</div>';

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

function createMarker(trainArray, station)
{
   	var marker = new google.maps.Marker({
   		position: new google.maps.LatLng(trainArray[station][1], trainArray[station][2]),
  	});
  	marker.setMap(map);

  	infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(marker, 'click', (function(marker, station) {
    	return function() {
      		infowindow.setContent(infoContent);
      		infowindow.open(map, marker);
    }
  })(marker, station));
}

function createPolyline(coordinates)
{
    var polyline = new google.maps.Polyline({
	    path: coordinates,
	    strokeColor: color,
	    strokeOpacity: 2.0,
	    strokeWeight: 3
  	});
    polyline.setMap(map);
}
