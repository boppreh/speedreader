function createDisplayHandler(element) {
    var timedSegments = [],
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
};

var displayElement = document.getElementById("text-display"),
    speedInputElement = document.getElementById("speed-input");

var textInputElement = document.getElementById("text-input"),
    display = createDisplayHandler(displayElement),
    defaultDelay = 200;

speedInputElement.value = 60 * 1000 / defaultDelay;

displayElement.onclick = function () {
    if (display.isPlaying()) {
        display.stop();
    } else {
        display.play();
    }
}

function loadText() {
    var fullText = textInputElement.value,
        segments = extractSegments(fullText),
        timedSegments = calculateDelays(segments);

    display.load(timedSegments);
    defaultDelay = 60 * 1000 / speedInputElement.value;
    console.log(defaultDelay);
}

function extractSegments(text) {
    // Add extra space after sentences to create empty segment.
    text = text.replace('. ', '.  ');
    // Same for linebreaks.
    text = text.replace('\n', '  ');
    return text.split(/\s/);
}

function calculateDelays(segments) {
    var timedSegments = [];
    for (var i in segments) {
        var segment = segments[i],
            delayMultiplier = 1;

        // Space after sentences.
        if (segment == "") {
            delayMultiplier = 2;

        // Acronyms.
        } else if (segment == segment.toUpperCase()) {
            delayMultiplier = 3;

        // Contains extra punctuation.
        } else if (!segment.match(/^\w+$/)) {
            delayMultiplier = 2;

        }

        var delay = defaultDelay * delayMultiplier;
        timedSegments.push([delay, segment]);
    }
    return timedSegments;
}
