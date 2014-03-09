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
        if (timedSegments.length === 0) {
            progressElement.innerHTML = "";
            display("");
            return;
        }

        display(timedSegments[pos][1]);

        var current = totalSeconds(pos),
            total = totalSeconds(),
            percent = Math.floor(100 * current / total),
            wpm = Math.round(60 * timedSegments.length / total);

        progressElement.innerHTML = formatSeconds(total) + " (" + percent + "%, " + wpm + "wpm)";
    }

    function play() {
        if (pos >= timedSegments.length - 1) {
            return;
        }

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
    defaultDelay = 200,
    wordFrequency = {};

speedInputElement.value = 60 * 1000 / defaultDelay;

displayElement.onclick = function () {
    if (display.isPlaying()) {
        display.stop();
    } else {
        display.play();
    }
}

displayElement.ondblclick = function () {
    display.seek(0);
    display.stop();
}

function loadText() {
    defaultDelay = 60 * 1000 / speedInputElement.value;

    var fullText = textInputElement.value,
        segments = extractSegments(fullText),
        timedSegments = calculateDelays(segments);

    display.stop();
    display.load(timedSegments);
}

function extractSegments(text) {
    // Add extra space after sentences to create empty segment.
    text = text.replace(/\. /g, '.  ');
    // Same for linebreaks.
    text = text.replace(/\n/g, '  ');
    return text.split(/\s/);
}

function getFrequencyMultiplier(segment) {
    var language = document.querySelector('input[name="language"]:checked').value;
    if (language !== 'english') {
        return 1;
    }

    var match = segment.match(/\w+/);
    if (match) {
        var word = match[0],
            frequency = wordFrequency[word.toLowerCase()];

        if (frequency) {
            return 2 / Math.log(Math.log(frequency));
        }
    }

    return 1;
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

        // Numbers are important and hard to read.
        } else if (segment.match(/^\d+$/)) {
            delayMultiplier = 2;

        // Contains extra punctuation.
        } else if (!segment.match(/^\w+$/)) {
            delayMultiplier = 2;

        }

        var frequencyMultiplier = getFrequencyMultiplier(segment),
            delay = defaultDelay * delayMultiplier * frequencyMultiplier;
        timedSegments.push([delay, segment]);
    }
    return timedSegments;
}

var client = new XMLHttpRequest();
client.open('GET', 'frequent_words.txt');
client.onreadystatechange = function() {
    if (client.readyState < 4) {
        return;
    }

    var text = client.responseText,
        regex = /(\w+)\s(\d+)/g,
        match = regex.exec(text);

    while (match != null) {
        wordFrequency[match[1]] = Number(match[2]);
        match = regex.exec(text);
    }
}
client.send();
