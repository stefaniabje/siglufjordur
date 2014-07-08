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

var crossbow = {
    id: "crossbow",
    icon_path: '/static/img/x.png',
    position: {latitude: 66.152076, longitude: -18.908227}
};
var skull = {
    id: "skull",
    icon_path: '/static/img/skull.svg',
    position: {latitude: 66.148903, longitude: -18.905641}
};
var places = [crossbow, skull];

var scale = 20000.0;


$(function () {
    // for (var place in places) {

    // }

    $("#viewport").height(windowHeight);

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

});


function positionChanged(position) {

    var coords = position.coords;

    var you = {
        id: "you",
        icon_path: '/static/img/you.svg',
        position: {latitude: coords.latitude, longitude: coords.longitude}
    };

    // Set map as parent around the places
    $("#map").css("position", "relative");
    // Locate upper right corner of map to center of screen
    $("#map").css("left", center.left);
    $("#map").css("top", center.top);

    // Add you to screen, set position relative to map (it's parent)
    $("#you").css("position", "absolute").css("width", "20px").css("z-index", 100);
    // Set center of "you" circle to upper right corner of map
    $("#you").css("left", - $("#you").width() / 2.0);
    $("#you").css("top", - $("#you").height() / 2.0);

    // Add places to map
    $("#crossbow").css("position", "absolute").css("width", "20px");
    $("#skull").css("position", "absolute").css("width", "20px");

    // Locate places relative to you, and scale map
    $("#crossbow").css("left", (crossbow.position.longitude - you.position.longitude) * scale);
    $("#crossbow").css("top", -(crossbow.position.latitude - you.position.latitude) * scale);
    $("#skull").css("left", (skull.position.longitude - you.position.longitude) * scale);
    $("#skull").css("top", -(skull.position.latitude - you.position.latitude) * scale);


    $("#debug #location").text("Timestamp: " + position.timestamp
        + ", lat: " + coords.latitude
        + ", lon: " + coords.longitude
        + ", accuracy: " + coords.accuracy
    );
//     $("#debug #window").text("Window width: " + window.innerWidth
//         + ", window height: " + window.innerHeight
//     );
}

function deviceOrientationChanged(orientationEvent)
{
    var tiltLeftRight = orientationEvent.gamma;
    var tiltFrontBack = orientationEvent.beta;
    var compassDirection = orientationEvent.webkitCompassHeading;

    if(compassDirection)
    {
        // $("#debug #orientation").text("Degrees from North: " + compassDirection);


        // Set z-axis of rotation at 0% of map, i.e. center of screen
        $("#map").css("transform-origin",  "" + (0) + "% " + (0) + "%");
        // Rotate map around "you"
        $("#map").css("transform", "rotate(" + (-compassDirection) + "deg)");
    }
}
