function formatSeconds(seconds) {
    if (seconds < 60) {
        return seconds + "s";
    }

    var minutes = Math.floor(seconds / 60 % 60);
    if (seconds < 60 * 60) {
        return minutes + "m " + seconds % 60 + "s";
    }

    var hours = Math.floor(seconds / 3600);
    return hours + "h " + minutes + "m " + seconds % 60 + "s";
}

function createDisplayHandler(displayElement, progressElement) {
    var timedSegments = [],
        pos = 0,
        timeoutId = 0;

    function totalSeconds(maxIndex) {
        var totalMilliseconds = 0;
        for (var i in timedSegments) {
            totalMilliseconds += timedSegments[i][0];

            if (maxIndex !== undefined && i == maxIndex) {
                break;
            }
        }
        return Math.round(totalMilliseconds / 1000);
    }

    function display(text) {
        displayElement.innerHTML = text;
    }

    function update() {
        display(timedSegments[pos][1]);

        var current = totalSeconds(pos),
            total = totalSeconds(),
            percent = Math.floor(100 * current / total);

        progressElement.innerHTML = formatSeconds(total) + " (" + percent + "%)";
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
    progressElement = document.getElementById("progress"),
    speedInputElement = document.getElementById("speed-input"),
    textInputElement = document.getElementById("text-input");

var display = createDisplayHandler(displayElement, progressElement),
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
}

function extractSegments(text) {
    // Add extra space after sentences to create empty segment.
    text = text.replace(/\. /g, '.  ');
    // Same for linebreaks.
    text = text.replace(/\n/g, '  ');
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
        } else if (segment.length > 1 && segment == segment.toUpperCase()) {
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
