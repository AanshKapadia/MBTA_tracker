function init()
{
	getMyLocation();
}

function getMyLocation()
{
	navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) 
{
	myLat = position.coords.latitude;
	myLng = position.coords.longitude;
	renderMap();
}

function error() 
{
  
}

function renderMap()
{
	me = new google.maps.LatLng(myLat, myLng);
	var myOptions = {
		zoom: 13,
		center: me,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	var marker = new google.maps.Marker({
		position: me,
		title: "Aansh Kapadia"
	});
	marker.setMap(map);
	
	infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});
 	renderBlueLine();
}

function renderRedLine()
{
	var RedLine = [
		["Red Line, Alewife", 42.395428,-71.142483],
		["Red Line, Davis",42.39674,-71.121815],
		["Red Line, Porter Square",42.3884,-71.11914899999999],
		["Red Line, Harvard Square",42.373362,-71.118956],
		["Red Line, Central Square",42.365486,-71.103802],
		["Red Line, Kendall/MIT",42.36249079,-71.08617653],
		["Red Line, Charles/MGH",42.361166,-71.070628],
		["Red Line, Park Street",42.35639457,-71.0624242],
		["Red Line, Downtown Crossing",42.355518,-71.060225],
		["Red Line, South Station",42.352271,-71.05524200000001],
		["Red Line, Broadway",42.342622,-71.056967],
		["Red Line, Andrew",42.330154,-71.057655],
		["Red Line, JFK/UMass",42.320685,-71.052391],
		["Red Line, North Quincy",42.275275,-71.029583],
		["Red Line, Wollaston",42.2665139,-71.0203369],
		["Red Line, Quincy Center",42.251809,-71.005409],
		["Red Line, Quincy Adams",42.233391,-71.007153],
		["Red Line, Braintree",42.2078543,-71.0011385],
		["Red Line, Savin Hill",42.31129,-71.053331],
		["Red Line, Fields Corner",42.300093,-71.061667],
		["Red Line, Shawmut",42.29312583,-71.06573796000001],
		["Red Line, Ashmont",42.284652,-71.06448899999999]
	];

    for (var i = 0; i < RedLine.length; i++) {  
      	var marker = new google.maps.Marker({
        position: new google.maps.LatLng(RedLine[i][1], RedLine[i][2]),
      	});
      	marker.setMap(map);
      	infowindow = new google.maps.InfoWindow();
    	google.maps.event.addListener(marker, 'click', (function(marker, i) {
        	return function() {
          		infowindow.setContent(RedLine[i][0]);
          		infowindow.open(map, marker);
        }
      })(marker, i));
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

    var redPath = new google.maps.Polyline({
	    path: RedLineCoordinates,
	    strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    strokeWeight: 2
  	});

    var redPath2 = new google.maps.Polyline({
	    path: RedLineCoordinates2,
	    strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    strokeWeight: 2
  	});

  	redPath.setMap(map);
  	redPath2.setMap(map);
}

function renderBlueLine()
{
	var BlueLine = [
		["Blue Line, Wonderland",42.41342,-70.991648],
		["Blue Line, Revere Beach",42.40784254,-70.99253321],
		["Blue Line, Beachmont",42.39754234,-70.99231944],
		["Blue Line, Suffolk Downs",42.39050067,-70.99712259],
		["Blue Line, Orient Heights",42.386867,-71.00473599999999],
		["Blue Line, Wood Island",42.3796403,-71.02286539000001],
		["Blue Line, Airport",42.374262,-71.030395],
		["Blue Line, Maverick",42.36911856,-71.03952958000001],
		["Blue Line, Aquarium",42.359784,-71.051652],
		["Blue Line, State Street",42.358978,-71.057598],
		["Blue Line, Government Center",42.359705,-71.05921499999999],
		["Blue Line, Bowdoin",42.361365,-71.062037]
	];
    for (var i = 0; i < BlueLine.length; i++) {  
      	var marker = new google.maps.Marker({
        position: new google.maps.LatLng(BlueLine[i][1], BlueLine[i][2]),
      	});
      	marker.setMap(map);
      	infowindow = new google.maps.InfoWindow();
    	google.maps.event.addListener(marker, 'click', (function(marker, i) {
        	return function() {
          		infowindow.setContent(BlueLine[i][0]);
          		infowindow.open(map, marker);
        }
      })(marker, i));
    }
	var blueLineCoordinates = [];
	for(var i = 0; i < BlueLine.length; i++) {
		blueLineCoordinates.push(new google.maps.LatLng(BlueLine[i][1], BlueLine[i][2]));
	}
    var bluePath = new google.maps.Polyline({
	    path: blueLineCoordinates,
	    strokeColor: "#FF0000",
	    strokeOpacity: 1.0,
	    strokeWeight: 2
  	});
  	bluePath.setMap(map);
}


