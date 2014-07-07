
$(function () {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(positionChanged);
    }
    else {
        alert("No GPS!");
    }

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', deviceOrientationChanged, false);
    }
    else {
        alert("No compass!");
    }

});


function positionChanged(position) {
    var coords = position.coords;

    var windowWidth=window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    var windowHeight=window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    // TODO: Doesn't make sense to be here, move into initalization
    $("#viewport").height(windowHeight);
    $("#you").css("left", windowWidth / 2.0 - $("#you").width() / 2.0);
    $("#you").css("top", windowHeight / 2.0 - $("#you").height() / 2.0);

    var imgWidth = 2880;
    var imgHeight = 1444;

    // coords = {
    //     latitude:  66.1529,
    //     longitude: -18.907,
    //     accuracy: 1
    // }

    var gpsFrame = {
        latitude: {min: 66.146800, max: 66.159258},
        longitude: {min: -18.937770, max: -18.876316}
    };

    var gpsRange = {
        latitude: gpsFrame.latitude.max - gpsFrame.latitude.min,
        longitude: gpsFrame.longitude.max - gpsFrame.longitude.min
    };

    var pxlPerDegree = {
        x: imgWidth / gpsRange.longitude,
        y: -1 * imgHeight / gpsRange.latitude
    };

    var degreesFrom = {
        left: (gpsFrame.longitude.min - coords.longitude),
        top: (gpsFrame.latitude.max - coords.latitude)
    };

    var pixelsFrom = {
        left: degreesFrom.left * pxlPerDegree.x,
        top: degreesFrom.top * pxlPerDegree.y
    };

    var youPosition = {
        left: windowWidth / 2,
        top: windowHeight / 2
    };

    $("#map").css("left", youPosition.left + pixelsFrom.left);
    $("#map").css("top", youPosition.top + pixelsFrom.top);
    $("#map").css("transform-origin",  "" + (-pixelsFrom.left) + "px "
                                          + (-pixelsFrom.top) + "px");


//     $("#debug #location").text("Timestamp: " + position.timestamp
//         + ", lat: " + coords.latitude
//         + ", lon: " + coords.longitude
//         + ", accuracy: " + coords.accuracy
//     );
//     $("#debug #window").text("Window width: " + window.innerWidth
//         + ", window height: " + window.innerHeight
//     );

//     $("#debug #gpsframe").text("Latitude range: " + gpsFrame.latitude.min + ' - ' + gpsFrame.latitude.max
//         + "Longitude range: " + gpsFrame.longitude.min + ' - ' + gpsFrame.longitude.max
//         + " RANGE: " + gpsRange.longitude + ' and ' + gpsRange.latitude
//     );

//     $("#debug #convertion").text(
//         'Pixels per degree: longitude' + pxlPerDegree.y + ' latitude: ' + pxlPerDegree.x
//     );

//     $("#debug #framelocation").text(
//         'Degrees from top: ' + degreesFrom.top + ' Degrees from left: ' + degreesFrom.left
//         + 'Pixels from top: ' + pixelsFrom.top + ' Pixels from left: ' + pixelsFrom.left
//     );
}

function deviceOrientationChanged(orientationEvent)
{
    var tiltLeftRight = orientationEvent.gamma;
    var tiltFrontBack = orientationEvent.beta;
    var compassDirection = orientationEvent.webkitCompassHeading;

    if(compassDirection)
    {
        $("#debug #orientation").text(
            "Left Right: " + tiltLeftRight +
            " Front Back: " + tiltFrontBack +
            " Compass Direction: " + compassDirection
        );

        $("#map").css("transform", "rotate(" + (- compassDirection) + "deg)");
    }
}
