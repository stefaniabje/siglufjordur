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
var school = {
    id: "school",
    icon_path: '/static/img/school.png',
    position: {latitude: 66.153109, longitude: -18.911886}
};
var althyduhusid = {
    id: "althyduhusid",
    icon_path: '/static/img/althyduhusid.png',
    position: {latitude: 66.152959, longitude: -18.907817},
    havePlayed: false
};

var places = [crossbow, skull, school, althyduhusid];

var scale = 40000.0;
// Depending on globe location, there is a certain scale between
// degrees and kilometers, not identical for longitude and latitude.
// In Siglufjörður it is the following:
var km_per_degree = {longitude: 0.749, latitude: 1.853}


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

    // $("#soundport")
    $("#button").css({
       'position': 'relative',
       width: '100px',
       'z-index': '500'
    });
    $("#button").css('display', 'none')
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
    // Locate upper left corner of map to center of screen
    $("#map").css("left", center.left);
    $("#map").css("top", center.top);

    // Add you to screen, set position relative to map (it's parent)
    $("#you").css("position", "absolute").css("width", "5px").css("z-index", 100);
    // Set center of "you" circle to upper right corner of map
    $("#you").css("left", - $("#you").width() / 2.0);
    $("#you").css("top", - $("#you").height() / 2.0);

    // Add places to map
    $("#school").css("position", "absolute").css(
        "width", "20px").css(
        "left", - $("#school").width() / 2.0).css(
        "top", - $("#school").height() / 2.0);
    $("#althyduhusid").css("position", "absolute").css(
        "width", "20px").css(
        "left", - $("#althyduhusid").width() / 2.0).css(
        "top", - $("#althyduhusid").height() / 2.0);


    function pixelfy(place_position) {
        // Transform  degrees to km and scale it up
        var pxls_per_degree = {longitude: km_per_degree.longitude * scale,
            latitude: km_per_degree.latitude * scale};
        // Convert location difference GPS vector to pixel vector
        var pxl_position = {
            x: (place_position.longitude - you.position.longitude) * pxls_per_degree.longitude,
            y: - (place_position.latitude - you.position.latitude) * pxls_per_degree.latitude};
    return pxl_position;
    }


    school["pxl_position"] = pixelfy(school.position);
    $("#school").css("left", school.pxl_position.x).css("top", school.pxl_position.y);
    althyduhusid["pxl_position"] = pixelfy(althyduhusid.position);
    $("#althyduhusid").css("left", althyduhusid.pxl_position.x).css("top", althyduhusid.pxl_position.y);


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
        $("#debug #orientation").text("Degrees from North: " + compassDirection);


        // Set z-axis of rotation at 0% of map, i.e. center of screen
        $("#map").css("transform-origin",  "" + (0) + "% " + (0) + "%");
        // Rotate map around "you"
        $("#map").css("transform", "rotate(" + (-compassDirection) + "deg)");
        $("#school").css("transform", "rotate(" + (compassDirection) + "deg)");
        $("#althyduhusid").css("transform", "rotate(" + (compassDirection) + "deg)");
        var onClick = function() {
            $('#wave')[0].load(); // audio will load
            // Hiding button
            $('#button').css('display', 'none');

            althyduhusid.havePlayed = true; // Added this to fix that the button
                                            // immediately showed up again
        };
        if (compassDirection > 300 && althyduhusid.havePlayed == false) {
            // Showing button
            $('#button').css({
                'display': 'initial',
                "left": center.left - $('#button').width() / 2.0,
                "top": center.top - $('#button').height() / 2.0
            });
            // Following button and reacting with onClick if it is clicked
            $("#button").bind( "click", onClick);
            $('#wave')[0].play();
        } else {
            // Hiding button if leaving correct span
            $('#button').css('display', 'none');
        }

    }
}
