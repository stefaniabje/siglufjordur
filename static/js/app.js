var windowWidth=window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var windowHeight=window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

// Define the screen center
var center = {
    left: windowWidth / 2.0,
    top: windowHeight / 2.0
};

// The user's coordinates. Global for acces in other functions.
var coords;


var crossbow = {
    id: "crossbow",
    position: {latitude: 66.1486, longitude: -18.908227}
    timecode: {start: 0, end: 5},
    playDistance: 5
};
var skull = {
    id: "skull",
    position: {latitude: 66.148903, longitude: -18.905641},
    timecode: {start: 0, end: 5},
    playDistance: 5
};
var school = {
    id: "school",
    position: {latitude: 66.153109, longitude: -18.911886},
    timecode: {start: 0, end: 5},
    playDistance: 5
};
var althyduhusid = {
    id: "althyduhusid",
    position: {latitude: 66.152959, longitude: -18.907817},
    timecode: {start: 0, end: 5},
    playDistance: 5
};
var chrysler = {
    id: "chrysler",
    position: {latitude: 66.152836, longitude: -18.910131},
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

var places = [crossbow, skull, school, althyduhusid, chrysler, good, bad, hot, cool];

// pixels per km
var scale = 8000.0; 
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


$(function () {
    // Initialize places
    for (var place in places) {
        $("#" + places[place].id).attr("src", "/static/img/" + places[place].id + ".png");
        places[place]["havePlayed"] = false;
        $("#" + places[place].id).css("position", "absolute").css("width", "60px");
        $("#" + places[place].id).css("transform", "translate(" + (-places[place].width/2) + "px, " + (-places[place].height/2) + "px)" );
    }

    $("#viewport").height(windowHeight);

    // If we access the user's geolocation:
    if (navigator.geolocation) {
        // Follow position changes as events
        navigator.geolocation.watchPosition(positionChanged);
    }
    else {
        alert("No GPS!");
    }

    // If the user'device s has orientation (LG7II does not have it for example)
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

    audioPlayer.init();

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

    coords = position.coords;

    var you = {
        id: "you",
        icon_path: '/static/img/you.svg',
        position: {latitude: coords.latitude, longitude: coords.longitude}
    };

    // Set map as parent around the places
    $("#map").css("position", "relative");
    // Locate upper left corner of map to center of screen
    $("#map").css("left", center.left);
    $("#map").css("top", center.top);

    // Add you to screen, set position relative to map (it's parent)
    $("#you").css("position", "absolute").css("width", "20px").css("z-index", 100);
    // Set center of "you" circle to upper right corner of map
    $("#you").css("left", - $("#you").width() / 2.0);
    $("#you").css("top", - $("#you").height() / 2.0);

    // Move all places to their place
    for (var place in places) {
        places[place]["pxl_position"] = pixelfy(places[place].position);
        $("#" + places[place].id).css("left", places[place].pxl_position.x).css("top", places[place].pxl_position.y);
    }

    $("#debug").text("Timestamp: " + position.timestamp + "\n"
        + "Lat: " + coords.latitude + "\n"
        + "Lon: " + coords.longitude + "\n"
        + "Accuracy: " + coords.accuracy + "\n"
        + "Cool: " + distanceTo(cool.position) + "\n"
        + " Hot: " + distanceTo(hot.position) + "\n"
        + "Good: " + distanceTo(good.position) + "\n"
        + " Bad: " + distanceTo(bad.position) + "\n"
    );
//     $("#debug #window").text("Window width: " + window.innerWidth
//         + ", window height: " + window.innerHeight
//     );

    var onClick = function() {

        $('#test')[0].load(); // audio will load
        // Hiding button
        $('#button').css('display', 'none');
        cool.havePlayed = true; // Added this to fix that the button
                                // immediately showed up again
    };

    if (cool.havePlayed === false)
    { // distanceTo(cool.position) <  cool.playDistance && cool.havePlayed == false) {
        // Showing button
        $('#button').css({
            'display': 'initial',
            "left": center.left - $('#button').width() / 2.0,
            "top": center.top*1.5 - $('#button').height() / 2.0
        });

        // // Following button and reacting with onClick if it is clicked
        // $("#button").bind( "click", onClick);
        // // Jump to the right place in the audiofile.
        // $('#test').bind('canplay', function() {
        //     this.currentTime = cool.timecode.start;
        // });
        // $('#test')[0].play();
    } else {
        // Hiding button if leaving correct span
        $('#button').css('display', 'none');
    }
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
        // Rotate the icons back
        for(var place in places){
            $("#" + places[place].id).css("transform", "rotate(" + (compassDirection) + "deg)");
        }
        //$("#you").css("transform","rotate(" + compassdirection + "deg)");
    }
}

// Calculates the distance to a place. Returns the answer in metres.
function distanceTo(position){
    var dx = (position.latitude - coords.latitude) * km_per_degree.latitude;
    var dy = (position.longitude - coords.longitude) * km_per_degree.longitude;
    dx = dx*dx;
    dy = dy*dy;
    return Math.sqrt(dx+dy)*1000;
}

// Takes in a position in lat-long-coordinates. Returns position in pixels from user.
// x direction is east and y direction is south.
function pixelfy(place_position) {
    // Transform  degrees to km and scale it up
    var pxls_per_degree = {longitude: km_per_degree.longitude * scale,
        latitude: km_per_degree.latitude * scale};
    // Convert location difference GPS vector to pixel vector
    var pxl_position = {
        x: (place_position.longitude - coords.longitude) * pxls_per_degree.longitude,
        y: - (place_position.latitude - coords.latitude) * pxls_per_degree.latitude};
    return pxl_position;
}
