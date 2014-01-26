var VQurl = "parco.txt";
var map;
var maPositionMarker;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('deviceready', initializeMap, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.hide();
        $("#btnGetPanneaux").click(function(){getPanneaux()});
        $("#btnLocate").click(function(){onLocate()});
       
    }, 
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
        console.log('Received Event: ' + id);
              
    }
   
};


function getPanneaux() {
   var JSdata;
    $.get(VQurl, function (data) {
        JSdata = $.parseJSON(data);
        

        for (var i = 0; i < JSdata.length; i++) {
            
            pos = new google.maps.LatLng(JSdata[i].lat, JSdata[i].long);
            panneauMrk = new google.maps.Marker(
                                                {
                                                    position: pos,
                                                    map: map,
                                                    title: 'Panneau ' + JSdata[i].id
                                                });

            (function (i, panneauMrk) {

                google.maps.event.addListener(panneauMrk, 'click', function () {

                    var infoWindow = new google.maps.InfoWindow(
                    {
                        content: 'Panneau ' + JSdata[i].id
                    });

                    infoWindow.open(map, panneauMrk);

                });

            })(i, panneauMrk);

        }

    }); 
}

function initializeMap() {
    
    var mapOptions = {
        center: new google.maps.LatLng(46.8050949, -71.2267805),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
   
}

function onLocate()
{
    navigator.geolocation.getCurrentPosition(onGeoLocationSucces, onGeoLocationError);
}

function onGeoLocationError(error)
{
   alert('code: '    + error.code    + '\n' +
         'message: ' + error.message + '\n');
}

function onGeoLocationSucces(location) 
{

    var maPlace = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    map.panTo(maPlace);

    var position = maPlace;
    var image = "img/bluedot.png";

    if (maPositionMarker)
    {
        maPositionMarker.setMap(null);    
    }
    maPositionMarker = new google.maps.Marker(
                                        {
                                            position: position,
                                            map: map,
                                            icon: image
                                        });
}


