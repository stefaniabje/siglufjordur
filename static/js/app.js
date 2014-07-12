var windowWidth = (window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth);

var windowHeight = (window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight);

// Define the screen center
var center = {
    left: windowWidth / 2.0,
    top: windowHeight / 2.0
};

var DEVICE_PIXEL_RADIO = window.devicePixelRatio;

var you = {
    id: "you",
    icon_path: '/static/img/you.png',
    position: null,
    _overriddenPosition: {
        // latitude: null,
        // longitude: null
        latitude: 66.152937,
        longitude: -18.907934
    },

    init: function()
    {
        this._bindDebugInputs();
    },

    _bindDebugInputs: function()
    {
        var self = this;
        $("#debug #lat").change(function() {
            var value = $(this).val();
            if(value !== "")
            {
                self._overriddenPosition.latitude = parseFloat(value);

                self.position.latitude = self._overriddenPosition.latitude;
            }
            else
            {
                self._overriddenPosition.latitude = null;
            }

            renderMap();
        });

        $("#debug #lon").change(function() {
            var value = $(this).val();
            if(value !== "")
            {
                self._overriddenPosition.longitude = parseFloat(value);

                self.position.longitude = self._overriddenPosition.longitude;
            }
            else
            {
                self._overriddenPosition.longitude = null;
            }

            renderMap();
        });
    },

    updatePosition: function(position)
    {
        this.position = {longitude: position.longitude, latitude: position.latitude};

        if(this._overriddenPosition.longitude)
        {
            this.position.longitude = this._overriddenPosition.longitude;
        }

        if(this._overriddenPosition.latitude)
        {
            this.position.latitude = this._overriddenPosition.latitude;
        }
    }
};

var nearestPlace;


var catalina = {
    id: "catalina",
    position: {latitude: 66.145453, longitude: -18.913870},
    timecode: {start: 0, end: 1*60+12},
    playDistance: 60
};

var blockage = {
    id: "blockage",
    position: {latitude: 66.145453, longitude: -18.913870},
    timecode: {start: 1*60+13, end: 3*60+41},
    playDistance: 5
};

var skramuhyrna = {
    id: "skramuhyrna",
    position: {latitude: 66.181559, longitude: -18.923616},
    timecode: {start: 3*60+42, end: 6*60+30},
    playDistance: 5
};

var arcticstern = {
    id: "arcticstern",
    position: {latitude: 66.135502, longitude: -18.921606},
    timecode: {start: 6*60+30, end: 8*60+45},
    playDistance: 5
};

var skull = {
    id: "skull",
    position: {latitude: 66.148008, longitude: -18.912512},
    timecode: {start: 8*60+46, end: 10*60+49},
    playDistance: 5
};

var betweenshipandshore = {
    id: "betweenshipandshore",
    position: {latitude: 66.147946, longitude: -18.902645},
    timecode: {start: 10*60+50, end: 13*60+56},
    playDistance: 5
};

var crossbow = {
    id: "crossbow",
    position: {latitude: 66.144336, longitude: -18.916552},
    timecode: {start: 13*60+57, end: 15*60+32},
    playDistance: 5
};

var hvanneyrarskal = {
    id: "hvanneyrarskal",
    position: {latitude: 66.158233, longitude: -18.917498},
    timecode: {start: 15*60+33, end: 17*60+46},
    playDistance: 5
};

var raudka = {
    id: "raudka",
    position: {latitude: 66.149680, longitude: -18.905918},
    timecode: {start: 17*60+47, end: 20*60+4},
    playDistance: 5
};

var onland = {
    id: "onland",
    position: {latitude: 66.154025, longitude: -18.904471},
    timecode: {start: 20*60+4, end: 25*60+13},
    playDistance: 5
};


// var onland = {
//     id: "onland",
//     position: {latitude: 66.152902, longitude: -18.908108},
//     timecode: {start: 20*60+4, end: 25*60+13},
//     playDistance: 20
// };


var places = [catalina, blockage, skramuhyrna, arcticstern,
    skull, betweenshipandshore, crossbow, hvanneyrarskal,
    raudka, onland];

// pixels per km
// TODO convert scale to be relative to pixels per screen!
var scale = 200.0;

// Depending on globe location, there is a certain scale between
// degrees and kilometers, not identical for longitude and latitude.
// In Siglufjörður it is the following:
var km_per_degree = {longitude: 44.96, latitude: 111.18};


var audioPlayer = {
    _nowPlayingPlace: null,
    _player : null,
    init: function()
    {
        var self = this;

        this._player = $("#test")[0];
        this._bindTimeupdate();

        $("#test").bind("canplaythrough", function()
        {
            self.hasPreloadedAudioSprite = true;

            if(self._preloadOnCompletionCallback)
            {
                self._preloadOnCompletionCallback();
            }

            $(this).unbind("canplaythrough");
        });
    },

    _bindTimeupdate: function()
    {
        var self = this; // Required because in the event callback, this becomes the event.

        $("#test").bind("timeupdate", function()
        {
            if(!self._nowPlayingPlace)
            {
                self._player.pause();
                return;
            }

            console.log(self._nowPlayingPlace);

            if(self._player.currentTime >= self._nowPlayingPlace.timecode.end)
            {
                self._player.pause();
                self._nowPlayingPlace = null;
            }
        });
    },

    _preloadOnCompletionCallback: null,
    hasPreloadedAudioSprite: false,
    preloadAudioSprite: function(onCompletionCallback)
    {
        // This is a hack to preload the whole audio file without actually playing
        // a sound. Must be initalized from a touch event context on mobile.
        this._player.play();
        this._player.pause();

        this._preloadOnCompletionCallback = onCompletionCallback;
    },

    playSoundForPlace: function (place)
    {
        this._player.currentTime = place.timecode.start;
        this._player.play();

        this._nowPlayingPlace = place;
    }
};


var debug = {
    _values: {},
    _coords: null,

    log: function(key, value)
    {
        this._values[key] = value;
        this._render();
    },

    _render: function()
    {
        var lines = [];
        for(var key in this._values)
        {
            var value = this._values[key];
            lines.push(key + ": " + value);
        }

        $("#debug pre").text(lines.join("\n"));
    }
};

var capabilities = {
    hasGPSSupport: false,
    hasOrientationSupport: false
};

var nearestPlaceAndDistance = null;


var splashScene = {
    id: "splash-scene",
    init: null
};

var noGPSScene = {
    id: "no-gps-scene",
    init: null
};

var loadingScene = {
    id: "loading-scene",
    init: function(transitionCallback)
    {
        transitionCallback();
        if(audioPlayer.hasPreloadedAudioSprite === false)
        {
            audioPlayer.preloadAudioSprite(function()
            {
                router.switchToScene("map-scene");
            });
        }
        else
        {
            router.switchToScene("map-scene");
        }
    }
};

var mapScene = {
    id: "map-scene",
    init: function(transitionCallback)
    {
        if (navigator.geolocation) {
            // Follow position changes as events
            navigator.geolocation.watchPosition(positionChanged)
        }

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', deviceOrientationChanged, false);
        }

        this._initMap();

        $("#story #storyfound").hide()
        $("#story #playstoryfound").click(function()
        {
            playSoundForNearestPlace();
        });

        $("#story #playstoryfound").hide();

        transitionCallback();
    },

    _initMap: function()
    {
        // Top left of map is the center of the screen
        $("#map").css({
            "left": center.left,
            "top": center.top
        });

        this._initCanvas();
        this._initPlaces();

        $("#map-scene").height(windowHeight);

        $("#you").css("left", windowWidth / 2.0 - $("#you").width() / 2.0);
        $("#you").css("top", windowHeight / 2.0 - $("#you").height() / 2.0);
    },

    _initCanvas: function()
    {
        var canvas = $("#canvas")[0];

        canvas.width = windowWidth * DEVICE_PIXEL_RADIO;
        canvas.height = windowHeight * DEVICE_PIXEL_RADIO;

        canvas.style.width = "" + windowWidth + "px";
        canvas.style.height = "" + windowHeight + "px";
    },

    _initPlaces: function()
    {
        var $map = $("#map");

        // Initialize places
        for (var placeIndex in places) {
            var place = places[placeIndex];

            place.havePlayed = false;

            var $place = $("<img />", {
                "id": place.id,
                "src": "/static/img/" + place.id + ".png",
                "class": "place"
            });

            $map.append($place);
        }
    }
};

var router = {
    _currentSceneID: null,
    _scenes: {
        "splash-scene": splashScene,
        "loading-scene": loadingScene,
        "map-scene": mapScene,
        "no-gps-scene": noGPSScene
    },
    init: function()
    {
        for(var sceneID in this._scenes)
        {
            $("#" + sceneID).hide();
        }

        var self = this;

        $("a.navigation").click(function(event) {
            event.preventDefault();

            self.switchToScene($(this).attr("href").replace("#", ""));
        });
    },
    switchToScene: function(nextSceneID)
    {
        var scene = this._scenes[nextSceneID];
        if(scene.init)
        {
            var self = this;
            scene.init(function()
            {
                self._setCurrentScene(nextSceneID);
            });
        }
        else
        {
            this._setCurrentScene(nextSceneID);
        }
    },

    _setCurrentScene: function(nextSceneID)
    {
        $("#" + this._currentSceneID).hide();
        $("#" + nextSceneID).show();
        this._currentSceneID = nextSceneID;
    }
};

function playSoundForNearestPlace()
{
    var place = nearestPlaceAndDistance.place;
    audioPlayer.playSoundForPlace(place);
}

function positionChanged(position) {
    you.updatePosition(position.coords);

    nearestPlaceAndDistance = findNearestPlace(you);

    // console.log("NearestPlace: ", nearestPlaceAndDistance.place);
    // console.log("NearestPlaceDistance: ", nearestPlaceAndDistance.distance);
    // debug.log("NearestPlace: ", nearestPlaceAndDistance.place)

    renderMap();
}

function renderMap()
{
    var context = setupAndClearContext();

    // Move all places to their place
    for (var placeIndex in places) {
        var place = places[placeIndex];

        place.px_position = pixelfy(you, place.position);

        var $place = $("#" + place.id);

        $place.css({
            "left": place.px_position.x - $place.width() / 2.0,
            "top": place.px_position.y - $place.height() / 2.0
        });

        drawLineToPlace(context, place, 4);
    }
    debug.log('NearestPlaceDistance', nearestPlaceAndDistance.distance);
    debug.log('NearestPlace', nearestPlaceAndDistance.place.id);
    debug.log('Latitude:', you.position.latitude);
    debug.log('Longitude:', you.position.longitude);
    if (nearestPlaceAndDistance.distance < 200)
    {
        // alert('REACHED PLACE!');
        // playSoundForNearestPlace();

        $("#story #storyfound").show();
        $("#story #playstoryfound").show();
        // debug.log("Button", $("#button"))
    }  // else {
    //     // Hiding button if leaving correct span
    //     $('#button').hide();
    // }

    // debug.log("Lat", you.position.latitude);
    // debug.log("Lon", you.position.longitude);
}


function setupAndClearContext()
{
    var $canvas = $("#canvas");
    var context = $canvas[0].getContext("2d");
    context.clearRect(0, 0, $canvas.width(), $canvas.height());

    return context;
}

function drawLineToPlace(context, place, lineWidth)
{
    context.beginPath();
    context.moveTo(center.left * DEVICE_PIXEL_RADIO, center.top * DEVICE_PIXEL_RADIO);
    context.lineTo(
        (place.px_position.x + center.left) * DEVICE_PIXEL_RADIO,
        (place.px_position.y + center.top) * DEVICE_PIXEL_RADIO
    );
    context.lineWidth = lineWidth;
    context.strokeStyle = "#f5f5f0";
    context.stroke();
}

function findNearestPlace(you)
{
    var nearestPlace = null;
    var distanceToNearestPlace = Infinity;

    for(var placeIndex in places)
    {
        var place = places[placeIndex];

        var distanceToPlace = distanceTo(you, place.position);
        if(distanceToPlace < distanceToNearestPlace)
        {
            distanceToNearestPlace = distanceToPlace;
            nearestPlace = place;
        }
    }

    return {place: nearestPlace, distance: distanceToNearestPlace};
}


function deviceOrientationChanged(orientationEvent)
{
    var tiltLeftRight = orientationEvent.gamma;
    var tiltFrontBack = orientationEvent.beta;
    var compassDirection = orientationEvent.webkitCompassHeading;

    if(compassDirection){
        // Set z-axis of rotation at 0% of map, i.e. center of screen
        $("#map").css("transform-origin",  "" + (0) + "% " + (0) + "%");
        // Rotate map around "you"
        $("#map").css("transform", "rotate(" + (-compassDirection) + "deg)");

        $("#canvas").css({
            "transform-origin": "50% 50%",
            "transform": "rotate(" + (-compassDirection) + "deg)"
        });

        // // Rotate the icons back
        for(var placeIndex in places){
            var place = places[placeIndex];
            $("#" + place.id).css("transform", "rotate(" + (compassDirection) + "deg)");
        }
    }
}

// Calculates the distance to a place. Returns the answer in metres.
function distanceTo(you, position){
    var dx = (position.latitude - you.position.latitude) * km_per_degree.latitude;
    var dy = (position.longitude - you.position.longitude) * km_per_degree.longitude;
    dx = dx*dx;
    dy = dy*dy;
    return Math.sqrt(dx+dy)*1000;
}


// Takes in a position in lat-long-coordinates. Returns position in pixels from user.
// x direction is east and y direction is south.
function pixelfy(you, place_position) {
    // Transform  degrees to km and scale it up
    var pxls_per_degree = {longitude: km_per_degree.longitude * scale,
        latitude: km_per_degree.latitude * scale};
    // Convert location difference GPS vector to pixel vector
    var px_position = {
        x: (place_position.longitude - you.position.longitude) * pxls_per_degree.longitude,
        y: - (place_position.latitude - you.position.latitude) * pxls_per_degree.latitude};
    return px_position;
}


$(function () {
    you.init();
    audioPlayer.init();
    router.init();

    capabilities.hasGPSSupport = navigator.geolocation;
    capabilities.hasOrientationSupport = window.DeviceOrientationEvent;

    if(capabilities.hasGPSSupport)
    {
        router.switchToScene("splash-scene");
    }
    else
    {
        router.switchToScene("no-gps-scene");
    }
});
