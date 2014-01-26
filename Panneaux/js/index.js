// ------------------------------------------------------------------------------------------------------
// Démo pour le dévelopement d'applications hybride utilisant Cordova.
// L'environnement de développement est Telerik Platform (anciennement Icenium), mais tout le projet 
// pourrait facilement être utilisé dans Adobe PhoneGap / PhoneBuild dans un environnement de votre choix
// ------------------------------------------------------------------------------------------------------
// Les fonctions de l'applications demo sont:
//    - Gestion de l'état de connectivité du périphérique (offline / online)
//    - Chargement d'un jeu de données (panneaux) via un fichier local (parsing JSON)
//    - Affichage d'une carte via l'API de Google Maps V3
//    - Affichage de mashup pour emplacement des panneaux (closure)
//    - Géolocalisation de l'utilisateur
//
// Tous les plugins Cordova sont activés, la bonne pratique recommande de n'activer que ceux utilisés
// ------------------------------------------------------------------------------------------------------
// Documentation Cordova: http://cordova.apache.org/docs/en/3.2.0/index.html
// Documentation Telerik Platform : http://docs.telerik.com/platform
// Documentation GoogleMaps: https://developers.google.com/maps/documentation/javascript/reference?hl=FR
// ------------------------------------------------------------------------------------------------------
// Guy Provost, Janvier 2014
// ------------------------------------------------------------------------------------------------------

var VQurl = "parco.txt";    // Simili appel à un service REST. Pour le moment, les parcomètres sont dans un fichier texte
var map;                    // Objet Google Map
var maPositionMarker;       // Pour représenter la géolocalisation de l'utilisateur

// Objet app représentant l'application elle même
// --------------
var app = {
    // Constructeur
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind events
    // --------------
    // Binding des évènements de démarrage de l'application. Les évènements courant sont:
    // 'load', 'deviceready', 'offline', et 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('online', this.onOnline, false);
    },
    
    // Évènement "deviceready", indique que Cordova est chargé et prêt. Tout le code
    // d'initialisation devrait se trouver ici.
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.hide();
        initializeMap();
        $("#btnGetPanneaux").click(function(){onGetPanneaux()});
        $("#btnLocate").click(function(){onLocate()});
       
    }, 
    
    onOffline: function() {
      app.receivedEvent('offline');  
    },
    
    onOnline: function() {
      app.receivedEvent('online');  
    },
    
    // Logging des évènements dans la console (utile pour debbugage)
    receivedEvent: function(id) {
        
        console.log('Évènement reçu: ' + id);
              
    }
   
};

// Gestion de l'évènement de demande de chargement des panneaux
// de signalisation (bouton "Panneaux" cliqué)
// -----------------
function onGetPanneaux() {
   
    // Chaque item du array JSdata contient l'info d'un panneau
    // soit: Latitude, longitude et id du panneau
    var JSdata;
    
    // Simulation d'un appel a un backend via un fichier texte (parco.txt)
    $.get(VQurl, function (data) {
        JSdata = $.parseJSON(data);
        
        // Créer un mashup pour chaque item du array
        for (var i = 0; i < JSdata.length; i++) {
            
            pos = new google.maps.LatLng(JSdata[i].lat, JSdata[i].long);
            panneauMrk = new google.maps.Marker(
                                                {
                                                    position: pos,
                                                    map: map,
                                                    title: 'Panneau ' + JSdata[i].id
                                                });
            
            // Binding d'un gestionnaire d'évènement pour chaque panneau
            (function (i, panneauMrk) {
                
                // Attacher un gestionnaire pour le click event de ce panneau (Marker)
                google.maps.event.addListener(panneauMrk, 'click', function () {
                    
                    // Chaque click sur le mashup fera apparaître cet infoWindow
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

// Initialisation de la carte, le centre est autour de Cartier/René Lévesque
// ----------------
function initializeMap() {
    
    var mapOptions = {
        center: new google.maps.LatLng(46.8050949, -71.2267805),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
   
}

// Gestion de l'évènement de demande de localisation (bouton "Localisation")
// ----------------
function onLocate()
{
    navigator.geolocation.getCurrentPosition(onGeoLocationSucces, onGeoLocationError);
}

// Gestion primitive d'une erreur de demande de localisation
// ----------------
function onGeoLocationError(error)
{
   alert('code: '    + error.code    + '\n' +
         'message: ' + error.message + '\n');
}

// Action a réaliser si la demande de geolocalisation est réussie
// ----------------
function onGeoLocationSucces(location) 
{
    var maPlace = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    map.panTo(maPlace);

    // Nous utilison une ressource locale image pour représenter l'emplacement
    // l'utilisateur
    var position = maPlace;
    var image = "img/bluedot.png";

    // Si un marker de position était déjà présent, le retirer
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


