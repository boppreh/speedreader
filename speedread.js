var display = (function() {
    var element = null,
        timedSegments = [],
        pos = 0,
        timeoutId = 0;

    function display(text) {
        element.innerHTML = text;
    }

    function update() {
        display(timedSegments[pos][1]);
    }

    function play() {
        pos++;
        update();

        var duration = timedSegments[pos][0];
        timeoutId = setTimeout(play, duration);
    }

    return {
        setElement: function (newElement) {
            element = newElement; 
        },

        load: function (newTimedSegments) {
            timedSegments = newTimedSegments;
            pos = 0;
            update();
        },

        play: play,

        stop: function () {
            clearTimeout(timeoutId);
            timeoutId = 0;
        },

        seek: function(newPos) {
            pos = newPos;
            update();
        },

        isPlaying: function() {
            return timeoutId != 0;
        },
    };
}());

var displayElement = document.getElementById("text-display");
display.setElement(displayElement);

displayElement.onclick = function () {
    if (display.isPlaying()) {
        display.stop();
    } else {
        display.play();
    }
}

function loadText() {
    var fullText = document.getElementById("text-input").value,
        segments = extractSegments(fullText),
        timedSegments = calculateDelays(segments);

    display.load(timedSegments);
}

function extractSegments(text) {
    return text.split(/\s/);
}

function calculateDelays(segments) {
    var timedSegments = [];
    for (var i in segments) {
        var segment = segments[i];
        timedSegments.push([100, segment]);
    }
    return timedSegments;
}

function updateButtons(stopState, continueState) {
    document.getElementById("stop-button").disabled = stopState;
    document.getElementById("continue-button").disabled = continueState;
}
