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
  console.log("Unable to retrieve your location");
}

function renderMap()
{
	var me = new google.maps.LatLng(myLat, myLng);
	var myOptions = {
		zoom: 13,
		center: me,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		var marker = new google.maps.Marker({
		position: me,
		title: "Aansh Kapadia"
	});
	marker.setMap(map);
	
	var infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});
}


