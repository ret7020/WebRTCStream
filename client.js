var blob;
if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
    var error = 'Your browser does NOT supports getDisplayMedia API.';
    document.querySelector('h1').innerHTML = error;

    document.querySelector('video').style.display = 'none';
    document.getElementById('btn-start-recording').style.display = 'none';
    document.getElementById('btn-stop-recording').style.display = 'none';
    throw new Error(error);
}


function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'monitor',
            logicalSurface: true,
            cursor: 'always'
        }
    };

    displaymediastreamconstraints = {
        video: true
    };

    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
    else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}

function captureScreen(callback) {
    invokeGetDisplayMedia(function (screen) {
        addStreamStopListener(screen, function () {
            if (window.stopCallback) {
                window.stopCallback();
            }

        });
        callback(screen);
    }, function (error) {
        console.error(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

function captureCamera(cb) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(cb);
}

function keepStreamActive(stream) {
    var video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    video.style.display = 'none';
    (document.body || document.documentElement).appendChild(video);
}


function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () { };
    }, false);
    stream.addEventListener('inactive', function () {
        callback();
        callback = function () { };
    }, false);
    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            callback();
            callback = function () { };
        }, false);
        track.addEventListener('inactive', function () {
            callback();
            callback = function () { };
        }, false);
    });
}


function start_recording() {
    captureScreen(function (screen) {
        console.log("Started");
        keepStreamActive(screen);
        captureCamera(function (camera) {
            keepStreamActive(camera);

            screen.width = window.screen.width;
            screen.height = window.screen.height;
            screen.fullcanvas = true;

            camera.width = 320;
            camera.height = 240;
            camera.top = screen.height - camera.height;
            camera.left = screen.width - camera.width;

            var recorder = RecordRTC([screen, camera], {
                type: 'video',
                mimeType: 'video/webm',
                previewStream: function (s) {
                    document.querySelector('video').muted = true;
                    document.querySelector('video').srcObject = s;
                }
            });

            recorder.startRecording();

            window.stopCallback = function () {
                window.stopCallback = null;

                recorder.stopRecording(function () {
                    blob = recorder.getBlob();
                    var fileName = getFileName('webm');

                    var fileObject = new File([blob], fileName, {
                        type: 'video/webm'
                    });

                    uploadToPHPServer(fileObject, function(response, fileDownloadURL) {
                        if(response !== 'ended') {
                            document.getElementById('header').innerHTML = response; // upload progress
                            return;
                        }

                        alert('Successfully uploaded recorded blob.');
                    });


                    document.querySelector('video').srcObject = null;
                    document.querySelector('video').src = URL.createObjectURL(blob);
                    document.querySelector('video').muted = false;
                    [screen, camera].forEach(function (stream) {
                        stream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    });
                });
            };
        });
    });
}