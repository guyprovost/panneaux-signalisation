// ------------------------------------------------------------------------------------------------------
// Démo pour le dévelopement d'applications hybride utilisant Cordova.
// L'environnement de développement est Telerik Platform (anciennement Icenium), mais tout le projet 
// pourrait facilement être utilisé dans Adobe PhoneGap / PhoneBuild dans un environnement de votre 
// choix. L'interface, html et css , sont à leurs plus simple expression afin de mettre en évidence
// les fonctions de Cordova.
// ------------------------------------------------------------------------------------------------------
// Les fonctions de l'applications demo sont:
//    - Gestion de l'état de connectivité du périphérique (offline / online)
//    - Chargement d'un jeu de données (panneaux) via un fichier local (parsing JSON)
//    - Affichage d'une carte via l'API de Google Maps V3
//    - Affichage de mashup pour emplacement des panneaux avec handler (closure)
//    - Géolocalisation de l'utilisateur
//    - Intégration de la boussole (Compass API)
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
var watchBoussoleID;        // 

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
    // -------------- 
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.hide();
        initializeMap();
        initializeBoussole();
        $("#btnGetPanneaux").click(function(){onGetPanneaux()});
        $("#btnLocate").click(function(){onLocate()});       
    }, 
    
    // Lorsque l'évènement offline survient, nous informons l'interface
    // --------------
    onOffline: function() {
      app.receivedEvent('offline');
      setUIState(0);
    },
    
    // Lorsque l'évènement online survient, nous informons l'interface
    // --------------
    onOnline: function() {
      app.receivedEvent('online');
      setUIState(1);  
    },
    
    // Logging des évènements dans la console (utile pour debbugage)
    // --------------
    receivedEvent: function(id) {
        
        console.log('Évènement reçu: ' + id);
              
    }
   
};

// ----------------------------------------------------------------------------------------------------
// Méthodes de l'application. Pourrait être dans un ou plusieurs autres fichiers.
// Elle sont toutes dans un seul et même fichier pour raison de simplicité.
// ----------------------------------------------------------------------------------------------------

// Affichage du label Online/Offline. 0 = Offline, autre = Online
// --------------
function setUIState(state) {
    
    if (state === 0)
    {
        $("#onlineState").html('<span class="label label-danger">Offline</span>');
    }
    else
    {
        $("#onlineState").html('<span class="label label-success">Online</span>');
    }
}

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

// Initialisation de la boussole, sera mis à jour à chaque demi-seconde
// ----------------
function initializeBoussole() {
    // Update compass every 3 seconds
        var options = { frequency: 500 };

        watchBoussoleID = navigator.compass.watchHeading(onBoussoleSuccess, onBoussoleError, options);
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

// Gestion de l'évènement boussole (à chaque 500 ms, ou la valeur de l'option frequency
// --------------
function onBoussoleSuccess(direction)
{
    
    $('#boussoleDirection').text(getDirectionString(direction.magneticHeading));
}

// Gestion erreur pour la boussole
// -------------
function onBoussoleError(boussoleError)
{
    alert('Erreur boussole: ' + boussoleError.code);    
}

// Retourne une chaine de caractères représentant la direction (N, NE, SE, etc)
// rawData contient la valeur en degrés de la direction courante (0 à 360)
// -------------
function getDirectionString(rawData)
{
    strDirection = "";
    
    if(rawData >23 && rawData <= 67)
    {
              strDirection = "NE";
        } else if(rawData >68 && rawData <= 112){
              strDirection = "E";
        } else if(rawData >113 && rawData <= 167){
              strDirection = "SE";
        } else if(rawData >168 && rawData <= 202){
              strDirection = "S";
        } else if(rawData >203 && rawData <= 247){
              strDirection = "SO";
        } else if(rawData >248 && rawData <= 293){
              strDirection = "O";
        } else if(rawData >294 && rawData <= 337){
              strDirection = "NO";
        } else if(rawData >=338 || rawData <= 22){
              strDirection = "N";
    }
    
    return strDirection;
}

