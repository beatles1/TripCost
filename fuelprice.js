var apiKey = 'Apxa6LR97lBurpUaAEImeJesKMQcPkFKUHHGui8m5LqxX2LrzIfxteDNeFGLQuv1';
var startPosition;
var endPosition;
var distance;
var travelMinutes;
var map;

window.onload = function(){
    $('#startInput').focusout(function() {
        setLocation($('#startInput').val(), 'start');
    });

    $('#endInput').focusout(function() {
        setLocation($('#endInput').val(), 'end');
    });

    // On local vars changed
    $('#fuelPrice').on('keyup', function () {
        calculateCost();
    });
    $('#mpg').on('keyup', function () {
        calculateCost();
    });
    $('#passengers').on('keyup', function () {
        calculateCost();
    });

    $('#roundTrip').change(function(){
        calculateCost();
    });

    $('.ui.checkbox').checkbox();

    startMap()
}

function setLocation(locationQueryString, startOrEnd) {

    $.getJSON( "https://dev.virtualearth.net/REST/v1/Locations/?key="+ apiKey +"&query="+ locationQueryString +"&maxResults=1", function( data ) {

        loc = data['resourceSets'][0]['resources'][0];

        lat = loc['point']['coordinates'][0];
        lon = loc['point']['coordinates'][1];
        addressString = loc['address']['formattedAddress'];
        
        if (startOrEnd != 'end') {
            startPosition = {'lon': lon, 'lat': lat, 'addressString': addressString};
            $('#startInput').val(addressString);
        } else {
            endPosition = {'lon': lon, 'lat': lat, 'addressString': addressString};
            $('#endInput').val(addressString);
        }
        calculateDistance()
    });
}

function calculateDistance() {
    if (startPosition && endPosition) {
        $('#routeSegment').addClass('loading');
        $.getJSON( "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix/?key="+ apiKey +"&origins="+ startPosition['lat'] +","+ startPosition['lon'] +"&destinations="+ endPosition['lat'] +","+ endPosition['lon'] +"&travelMode=driving&distanceUnit=mi&timeUnit=minute", function( data ) {
            distance = data['resourceSets'][0]['resources'][0]['results'][0]['travelDistance'];
            travelMinutes = data['resourceSets'][0]['resources'][0]['results'][0]['travelDuration'];
            $('#distanceLabel').text(distance.toFixed(2) +" miles");
            $('#travelTime').text(minsToString(travelMinutes.toFixed(2)));
            calculateCost()
            drawMap()
        });
    }
}

function calculateCost() {
    if (distance) {
        price = parseInt($('#fuelPrice').val());
        mpg = parseInt($('#mpg').val());

        mpl = mpg * 0.219969;

        litres = distance/mpl;
        pence = litres * price;
        pounds = pence / 100;
        
        if ($('#roundTrip').is(":checked")) {
            pounds = pounds * 2;
        }

        $('#result').val("£"+ pounds.toFixed(2));

        passengers = parseInt($('#passengers').val());
        perPassenger = pounds/passengers;
        $('#resultperpassenger').val("£"+ perPassenger.toFixed(2));
    }
}

function minsToString(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    if (rhours > 0) {
        return "" + rhours + " hours and " + rminutes + " minutes";
    } else {
        return "" + rminutes +" minutes"
    }
}

function startMap() {
    map = new Microsoft.Maps.Map(document.getElementById('routeMap'), {
        /* No need to set credentials if already passed in URL */
        center: new Microsoft.Maps.Location(51.5074, 0.1278),
        zoom: 3,
        showDashboard: false,
        showLocateMeButton: false,
        showMapTypeSelector: false,
        showScalebar: false,
        showTrafficButton: false,
        showZoomButtons: false,
        showTermsLink: false,
    });

    $('#routeSegment').removeClass('loading');
}

function drawMap() {
    startMap()
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        // Set Route Mode to driving
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
        var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: startPosition['addressString'], location: new Microsoft.Maps.Location(startPosition['lat'], startPosition['lon']) });
        var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: endPosition['addressString'], location: new Microsoft.Maps.Location(endPosition['lat'], endPosition['lon']) });
        directionsManager.addWaypoint(waypoint1);
        directionsManager.addWaypoint(waypoint2);
        // Set the element in which the itinerary will be rendered
        //directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') });
        directionsManager.calculateDirections();

        $('#routeSegment').removeClass('loading');
    });    
}