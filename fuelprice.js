var apiKey = 'Apxa6LR97lBurpUaAEImeJesKMQcPkFKUHHGui8m5LqxX2LrzIfxteDNeFGLQuv1';
var startPosition;
var endPosition;
var distance;
var travelMinutes;

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
        $.getJSON( "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix/?key="+ apiKey +"&origins="+ startPosition['lat'] +","+ startPosition['lon'] +"&destinations="+ endPosition['lat'] +","+ endPosition['lon'] +"&travelMode=driving&distanceUnit=mi&timeUnit=minute", function( data ) {
            distance = data['resourceSets'][0]['resources'][0]['results'][0]['travelDistance'];
            travelMinutes = data['resourceSets'][0]['resources'][0]['results'][0]['travelDuration'];
            $('#distanceLabel').text(distance.toFixed(2) +" miles");
            $('#travelTime').text(travelMinutes.toFixed(2) +" minutes");
            calculateCost()
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

        $('#result').val("£"+ pounds.toFixed(2));

        passengers = parseInt($('#passengers').val());
        perPassenger = pounds/passengers;
        $('#resultperpassenger').val("£"+ perPassenger.toFixed(2));
    }
}