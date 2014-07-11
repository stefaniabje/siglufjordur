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


var crossbow = {
    id: "crossbow",
    position: {latitude: 66.144336, longitude: -18.916552},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var skull = {
    id: "skull",
    position: {latitude: 66.148008, longitude: -18.912512},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var arcticstern = {
    id: "arcticstern",
    position: {latitude: 66.135502, longitude: -18.921606},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var blockage = {
    id: "blockage",
    position: {latitude: 66.145453, longitude: -18.913870},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var onland = {
    id: "onland",
    position: {latitude: 66.154025, longitude: -18.904471},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var hvanneyrarskal = {
    id: "hvanneyrarskal",
    position: {latitude: 66.158233, longitude: -18.917498},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var raudka = {
    id: "raudka",
    position: {latitude: 66.149680, longitude: -18.905918},
    timecode: {start: 0, end: 5},
    playDistance: 5
};

var skramuhyrna = {
    id: "skramuhyrna",
    position: {latitude: 66.181559, longitude: -18.923616},
    timecode: {start: 0, end: 5},
    playDistance: 5
};


var good = {
    id: "good",
    position: {latitude: 66.1529322714, longitude: -18.9079409},
    timecode: {start: 0, end: 5},
    playDistance: 5
};
var bad = {
    id: "bad",
    position: {latitude: 66.15277033, longitude: -18.90802432},
    timecode: {start: 5, end: 10},
    playDistance: 7
};
var hot = {
    id: "hot",
    position: {latitude: 66.15291052, longitude: -18.9076722879},
    timecode: {start: 10, end: 15},
    playDistance: 2
};
var cool = {
    id: "cool",
    position: {latitude: 66.152826366, longitude: -18.9080556761},
    timecode: {start: 15, end: 20},
    playDistance: 20
};

// var places = [crossbow, skull, arcticstern, blockage, onland, good, bad, hot, cool];
var places = [crossbow, skull, arcticstern, blockage, onland,
    hvanneyrarskal, raudka, skramuhyrna];

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
        this._player = $("#test")[0];
        this._bindTimeupdate();
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

    preloadAudioSprite: function()
    {
        // This is a hack to preload the whole audio file without actually playing
        // a sound. Must be initalized from a touch event context on mobile.
        this._player.play();
        this._player.pause();
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


$(function () {
    you.init();
    audioPlayer.init();

    var $map = $("#map");
    // Top left of map is the center of the screen
    $map.css({
        "left": center.left,
        "top": center.top
    });

    var canvas = $("#canvas")[0];
    console.log(canvas);
    canvas.width = windowWidth * DEVICE_PIXEL_RADIO;
    canvas.height = windowHeight * DEVICE_PIXEL_RADIO;

    canvas.style.width = "" + windowWidth + "px";
    canvas.style.height = "" + windowHeight + "px";


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

    $("#viewport").height(windowHeight);

    $("#you").css("left", windowWidth / 2.0 - $("#you").width() / 2.0);
    $("#you").css("top", windowHeight / 2.0 - $("#you").height() / 2.0);


    // If we access the user's geolocation:
    if (navigator.geolocation) {
        // Follow position changes as events
        navigator.geolocation.watchPosition(positionChanged);
    }
    else {
        alert("No GPS!");
    }

    // If the user's device has orientation (LG7II does not have it for example)
    if (window.DeviceOrientationEvent) {
        // Follow the orientation changes as events
        window.addEventListener('deviceorientation', deviceOrientationChanged, false);
    }
    else {
        alert("No compass!");
    }

    $("#button").css({
       'position': 'relative',
       width: '100px',
       'z-index': '500'
    });
    $("#button").hide();

    $("#viewport").hide();

    $("#start-button").click(function()
    {
        audioPlayer.preloadAudioSprite();

        $(this).text("Loading ...");
    });

    $("#test").bind("canplaythrough", function()
    {
        $("#alert").hide();
        $("#viewport").show();

        $(this).unbind("canplaythrough");
    });

    $("#button").click(function()
    {
        playSoundForNearestPlace();
    });
});

function playSoundForNearestPlace()
{
    var place = getNearestPlace();
    audioPlayer.playSoundForPlace(place);
}


function getNearestPlace () {
    var placesWithSounds = [good, bad, hot, cool];
    var randomPlace = placesWithSounds[Math.floor(Math.random() * placesWithSounds.length)];
    return randomPlace;
}

function positionChanged(position) {
    you.updatePosition(position.coords);

    renderMap();
}

function renderMap()
{
    console.log("Render Map");

    var $canvas = $("#canvas");
    var context = $canvas[0].getContext("2d");
    context.clearRect(0, 0, $canvas.width(), $canvas.height());

    // Move all places to their place
    for (var placeIndex in places) {
        var place = places[placeIndex];

        place.px_position = pixelfy(you, place.position);
        console.log(place.px_position);

        var $place = $("#" + place.id);

        $place.css({
            "left": place.px_position.x - $place.width() / 2.0,
            "top": place.px_position.y - $place.height() / 2.0
        });

        context.beginPath();
        context.moveTo(center.left * DEVICE_PIXEL_RADIO, center.top * DEVICE_PIXEL_RADIO);
        context.lineTo(
            (place.px_position.x + center.left) * DEVICE_PIXEL_RADIO,
            (place.px_position.y + center.top) * DEVICE_PIXEL_RADIO
        );
        context.lineWidth = 2;
        context.stroke();
    }

    if (false)
    { // distanceTo(cool.position) <  cool.playDistance && cool.havePlayed == false) {
        // Showing button
        $('#button').css({
            'display': 'initial',
            "left": center.left - $('#button').width() / 2.0,
            "top": center.top*1.5 - $('#button').height() / 2.0
        });

    } else {
        // Hiding button if leaving correct span
        $('#button').css('display', 'none');
    }

    debug.log("Lat", you.position.latitude);
    debug.log("Lon", you.position.longitude);
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
function distanceTo(position){
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
