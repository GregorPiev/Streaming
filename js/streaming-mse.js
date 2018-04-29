;
(function () {
    'use strict';
    var assetURL,
            videoElementWrapperId,
            mimeCodec,
            posterRoot,
            video,
            mimeCodec,
            totalLength = 0,
            segmentLength = 0,
            segmentChunk = 0,
            mediaSource,
            nextChunkTimeout = 0,
            firstChunkTimeout = 0,
            newSourceTimeout = 0,
            removeSourceTimeout,
            sourceBuffer,
            appendQueue = [],
            segmentQueue = [],
            appendBufferCounter = 1,
            counterCurrentTimeMove = 1,
            startStop = false,
            indexTesting = 0,
            segmentTesting = [6, 5, 4, 3, 2],
            firstLength = 0,
            koefLength = 1;

    function Player(config) {
        assetURL = config.url;
        videoElementWrapperId = config.wrapperID;
        mimeCodec = config.mimeCode;
        posterRoot = config.posterRoot;
    }

    Player.prototype.loadVideo = function () {
        _embedVideo();
    };
        function _embedVideo() {
        video = document.createElement('video');
                var wrapper_elem = document.getElementById(videoElementWrapperId);
                var controls = document.createAttribute("controls");
                video.setAttributeNode(controls);
                var style = document.createAttribute("style");
                style.value = "width:100%;margin:10px auto 10px auto";
                video.setAttributeNode(style);
                video.poster = posterRoot;
                wrapper_elem.appendChild(video);
                //////////// Event handler for the video element errors/////////////////////////////////////////////
    video.addEventListener("error", function (e) {
        // video playback failed - show a message saying why
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                console.log("%c Video Error:", 'color:#900;font-size:16px;', video.error);
                alert('You aborted the video playback.');
                break;
            case e.target.error.MEDIA_ERR_NETWORK:
                console.log("%c Video Error:", 'color:#900;font-size:16px;', video.error);
                alert('A network error caused the video download to fail part-way.');
                        _initAndStart();
                        break;
            case e.target.error.MEDIA_ERR_DECODE:
                console.log("%c Video Error:", 'color:#900;font-size:16px;', video.error);
                alert('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                        _initAndStart();
                        break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                console.log("%c Video Error:", 'color:#900;font-size:16px;', video.error);
                alert('The video could not be loaded, either because the server or network failed or because the format is not supported.');
                        _initAndStart();
                        break;
            default:
                console.log("%c Video Error:", 'color:#900;font-size:16px;', video.error);
                alert('An unknown error occurred.');
                        _initAndStart();
                        break;
        }
    }, false);
    ////////////////////////////////////////////////////////////
                video.addEventListener('click', function () {
                if (video.readyState == 4) {
                video.paused ? video.play() : video.pause();
                } else {
                (!startStop) ? _initAndStart() : _stopAndComplite();
                }
                });
                video.addEventListener('dblclick', function () {
                console.info("%c DBLCLICK", "color:navy;font-size:18px;");
                        (!startStop) ? _initAndStart() : _stopAndComplite();
                });
                _initAndStart();
                }



function _initAndStart() {
    console.log("%c \t\t<< Init And Start>>", "color:navy;font-size:28px;background-color:#ffccff;");
appendQueue.length = 0;
        segmentQueue.length = 0;
        totalLength = 0;
        segmentLength = 0;
        segmentChunk = 0;
        startStop = true;
        firstLength = 0;
        video.defaultPlaybackRate = 1;
        koefLength = 1;

        if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
            if (mediaSource) {
                mediaSource.endOfStream
                window.clearTimeout(removeSourceTimeout);
                window.clearTimeout(newSourceTimeout);
            }


            mediaSource = new MediaSource();
        console.log("_initAndStart:" + mediaSource.readyState); // closed
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', _sourceOpen);
} else {
alert('Unsupported MIME type or codec: ', mimeCodec);
}
    }

function _sourceOpen(_) {
mediaSource.removeEventListener('sourceopen', _sourceOpen);
        console.warn("%c \t\t<< Source Open Start>>", "color:navy;font-size:28px;background-color:#ffccff;");
        sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

        sourceBuffer.addEventListener('error', function (e) {
            alert("%c Source Buffer Error:", 'color:red;font-size:16px;' + e.message);
        });
        _getFirstSegment();
}


function _getFirstSegment() {
_getFileLength(assetURL, function (fileLength) {
if (!fileLength) {
            console.warn("%c Get First Segment. Filelength null", 'color:red; font-size:28px;background-color:#000;');
firstChunkTimeout = setTimeout(_getFirstSegment, 0.2 * 1000);
        return;
            } else {
                window.clearTimeout(firstChunkTimeout);
                totalLength = fileLength;
                segmentQueue.push(fileLength);
                firstLength = fileLength;

            console.log("%c \tStart FileLength: ", "color:green;font-size:14px;", fileLength);
            console.log("%c  \tStart Total Length: ", "color:green;font-size:14px;", totalLength);
            console.log("%c \t segment Length", "color:green;font-size:14px;", segmentQueue[0], '[' + new Date().toLocaleTimeString('he') + ']');

        _fetchRange(assetURL, function (chunk) {
                console.warn("%c \t\t<< Get First Chunk>>", "color:navy;font-size:18px;", '[' + new Date().toLocaleTimeString('he') + ']');
                    segmentChunk = chunk;
                    sourceBuffer.appendBuffer(segmentChunk);
                console.log("%c \t Append to Buffer", "color:navy;font-size:24px;", appendBufferCounter, '[' + new Date().toLocaleTimeString('he') + ']');
                video.addEventListener("canplaythrough", _startPlay);
        });

            }
        });
    }

function _startPlay() {
    console.log("%c \t\t<< Start Video Play >>", "color:navy;font-size:18px;background-color:#ffccff;", "  [" + new Date().toLocaleTimeString('he') + "]");
        video.play();
    console.log("%c \t Video Duration Start: ", "color:red;font-size:24px;", video.duration);
    console.log("%c \t\t<< Video is starting play: >>", "color:#f00;font-size:24px;", "  [" + video.currentTime + "]");

        video.removeEventListener("canplaythrough", _startPlay);


        var newFileTimeout = (video.duration - video.currentTime) * 0.6;
        newSourceTimeout = window.setTimeout(_getNextSegment, newFileTimeout * 1000);
    console.log("%c \t\tTime to new Segment From Start:", 'background-color:navy; color:yellow;font-size:16px;', newFileTimeout, '      [' + new Date().toLocaleTimeString('he') + ']');

    }
function _getNextSegment() {
window.clearTimeout(newSourceTimeout);
        _getFileLength(assetURL, function (fileLength) {
        console.warn("%c \t\t<< Time for check: >>", "color:green;font-size:18px;", "  [" + (video.currentTime - video.duration * 0.96) + "]");
            if ((!fileLength) || ((fileLength === totalLength) && (video.currentTime < video.duration * 0.97))) {
                console.warn("%c Get Next Segment. Seek for new file .Duplicate chunk, try again", 'color:red; font-size:28px;background-color:#000;');
            console.debug("nextChunkTimeout:", nextChunkTimeout);
            console.warn("%c \t\t<< Index Testing >>", "color:green;font-size:14px;", indexTesting);
                var timerGetNextSegment = ((indexTesting < segmentTesting.length) ? segmentTesting[indexTesting++] : 1) * 100;
            console.warn("%c \t\t<< Timer GetNextSegment >>", "color:green;font-size:14px;", timerGetNextSegment);
                var timerGetNextSegment = 200;
                nextChunkTimeout = setTimeout(_getNextSegment, timerGetNextSegment);
                return;
            } else {
                indexTesting = 0;
            console.warn("%c \t\t<< Get Next Segment >>", "color:green;font-size:18px;", '[' + new Date().toLocaleTimeString('he') + ']');
            console.warn("%c \t\t<< Video is plaing yet: >>", "color:#f00;font-size:24px;", "  [" + video.currentTime + "]");
                clearTimeout(nextChunkTimeout);
                clearTimeout(newSourceTimeout);

                totalLength = fileLength;
                segmentLength = fileLength;
                segmentQueue.push(segmentLength);

            console.warn("%c \tNext FileLength: ", "color:green;font-size:14px;", fileLength);
            console.warn("%c  \tNext Total Length: ", "color:green;font-size:14px;", totalLength);
            console.warn("%c \tNext Segment Length", "color:green;font-size:14px;", segmentLength, '[' + new Date().toLocaleTimeString('he') + ']');


                _fetchRange(assetURL, function (chunk) {
                console.warn("%c \t Buffer Increment: ", "color:green;font-size:24px;", '[' + new Date().toLocaleTimeString('he') + ']');
                    segmentChunk = chunk;
                    appendQueue.push(chunk);

                console.warn("%c \t Buffer queue length: ", "color:green;font-size:18px;", appendQueue.length);
                console.warn("%c \t Segment queue length: ", "color:green;font-size:18px;", segmentQueue.length);
                console.warn("%c \tArray segmentQueue: ", "color:green;font-size:18px;", segmentQueue);

                console.warn("%c \t\t<< Video is plaing yet: >>", "color:#f00;font-size:24px;", "  [" + video.currentTime + "]");
                    if (startStop) {
                _renewPlay();
                }
                }
                );

            }
        });

    }
function _renewPlay() {

        console.log("%c \t\t<< Video is plaing yet: >>", "color:#990099;font-size:24px;", "  [" + video.currentTime + "]", '[' + new Date().toLocaleTimeString('he') + ']');
        console.info("%c \t\t<< Remaining Time current session : >>", 'color:#990099;font-size:24px;', (video.duration - video.currentTime));
        console.log("%c << Segment Queue Array Before 00: >>", 'color:#990099;font-size:14px;', segmentQueue);

        console.log("%c \t\t<< First Length: >>", 'color:#990099;font-size:24px;', firstLength);
        koefLength = segmentQueue[0] / firstLength;

        console.info("%c \t\t<< Koeficient Weight 1 : >>", 'color:#990099;font-size:24px;', koefLength);
        koefLength = (koefLength < 0.95) ? 0.95 : koefLength;
        koefLength = (koefLength > 1.05) ? 1.05 : koefLength;
        console.info("%c \t\t<< Koeficient Weight 2 : >>", 'color:#900;font-size:24px;', koefLength);

        var lastTimeProgress = (video.duration - video.currentTime) * koefLength;
        console.info("%c \t\tTime to new Session _renewPlay 1:", 'background-color:navy; color:yellow;font-size:16px;', lastTimeProgress, '      [' + new Date().toLocaleTimeString('he') + ']');

        lastTimeProgress = (lastTimeProgress > 0) ? lastTimeProgress : 0;
        var endOldSource = lastTimeProgress * 1000;
        console.info("%c \t\tTime to new Session _renewPlay 2:", 'background-color:navy; color:yellow;font-size:16px;', lastTimeProgress, '      [' + new Date().toLocaleTimeString('he') + ']');


        if (lastTimeProgress) {
        removeSourceTimeout = window.setTimeout(function () {
            console.log("%c << New Segment Play Number: >>", 'color:#900;font-size:18px;', counterCurrentTimeMove, '      [' + new Date().toLocaleTimeString('he') + ']');
            if (startStop) {
_removePrevSegment(_replayVideo);
}
            window.clearTimeout(removeSourceTimeout);
            }, endOldSource);
        } else {
            console.log("%c << New Segment Play Number: >>", 'color:#900;font-size:18px;', counterCurrentTimeMove, '      [' + new Date().toLocaleTimeString('he') + ']');
            if (startStop) {
_removePrevSegment(_replayVideo);
}
        }

    }
function _removePrevSegment(callback) {
var waitingToRemoveBuffer = waitingToRemoveBuffer || window.clearInterval(waitingToRemoveBuffer);
        var upperBounder;

            if (!sourceBuffer.updating) {
        console.log("%c \t Segment queue length: ", "color:#900;font-size:18px;background-color:#e6ffff;", segmentQueue.length);
        console.log("%c \t Segment Length", "color:#900;font-size:18px;", segmentLength);

        console.log("%c << Segment Queue Array Before: >>", 'color:#900;font-size:14px;', segmentQueue);

                upperBounder = segmentQueue.shift();
        console.log("%c << Segment Queue Array After: >>", 'color:#900;font-size:14px;', segmentQueue);

        console.log("%c Upper Segment Bounder 1:", "color:#900;font-size:18px;background-color:#e6ffff;", upperBounder);
                sourceBuffer.remove(0, upperBounder);
                if (startStop) {
callback(_getNextSegment);
}
        } else {
waitingToRemoveBuffer = window.setTimeout(_removePrevSegment, 1, _replayVideo);
}

    }
function _replayVideo(cb) {
var waitingToBuffer = waitingToBuffer || window.clearInterval(waitingToBuffer);
        var currentChunk;
        if (!sourceBuffer.updating) {
            console.log("%c \t Append to Buffer", "color:#900;font-size:24px;", appendBufferCounter, '[' + new Date().toLocaleTimeString('he') + ']');
            currentChunk = appendQueue.shift();
            sourceBuffer.appendBuffer(currentChunk);
            appendBufferCounter++;

            video.currentTime = 0;
        console.log("%c \t Video Duration Continue:", "color:red;font-size:24px;", video.duration);
            console.log("%c \t\t<< Video is plaing yet: >>", "color:#900;font-size:24px;", "  [" + video.currentTime + "]", '[' + new Date().toLocaleTimeString('he') + ']');
            console.log("%c \t Move Current Time:", 'color:#900;font-size:24px;', counterCurrentTimeMove, '[' + new Date().toLocaleTimeString('he') + ']');
            counterCurrentTimeMove++;
            window.clearInterval(waitingToBuffer);

            var continueSourceTimeout = (video.duration - video.currentTime) * 0.4 * koefLength;
            console.log("%c \t\tTime to new Segment From Now:", 'background-color:navy; color:yellow;font-size:16px;', continueSourceTimeout, '      [' + new Date().toLocaleTimeString('he') + ']');

            if (startStop) {
                newSourceTimeout = window.setTimeout(cb, continueSourceTimeout * 1000);
            }
        } else {
waitingToBuffer = window.setTimeout(_replayVideo, 1, _getNextSegment);
}
    }

function _getFileLength(url, callback) {

var xhr = new XMLHttpRequest;
            xhr.open('head', url + "?dash=1&b=getFileLength&a=" + Math.random());
        xhr.onload = function () {
            if (xhr.status === 404) {
                console.info(xhr.status + ': ' + xhr.statusText);
                alert("Chat is complited");
                return;
            }
                var _fileLength = xhr.getResponseHeader('Content-Length');
            callback(_fileLength);
        };
            xhr.send();
}
function _fetchRange(url, callback) {
    console.warn("%c \t << Fetch >> -", "color:green;background-color:yellow;font-size:24px;", '[' + new Date().toLocaleTimeString('he') + ']');
        var xhr = new XMLHttpRequest;
        xhr.open('get', url + "?dash=1&a=" + Math.random());
        xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                callback(new Uint8Array(xhr.response));
            };
        xhr.send();
    }
function _stopAndComplite() {
console.info("%c _stopAndComplite", "color:navy;font-size:18px;");
        window.clearTimeout(newSourceTimeout);
        window.clearTimeout(removeSourceTimeout);
        startStop = false;
        video.pause();
    console.info("%c Media Source Ready State Start", "color:navy;font-size:18px;", mediaSource.readyState);
        mediaSource.endOfStream();
    }

    var playVideo = new Player(configValues);
    playVideo.loadVideo();
}(configValues));
