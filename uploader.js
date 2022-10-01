function uploadToPHPServer(blob, callback) {
    // create FormData
    var formData = new FormData();
    formData.append('video-filename', blob.name);
    formData.append('video-blob', blob);
    callback('Uploading recorded-file to server.');

    var upload_url = 'http://localhost:8080/upload';

    var upload_directory = upload_url;
    
    makeXMLHttpRequest(upload_url, formData, function(progress) {
        if (progress !== 'upload-ended') {
            callback(progress);
            return;
        }
        var initialURL = upload_directory + blob.name;
        callback('ended', initialURL);
    });
}

function makeXMLHttpRequest(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            if (request.responseText === 'success') {
                callback('upload-ended');
                return;
            }
            alert(request.responseText);
            return;
        }
    };
    request.upload.onloadstart = function() {
        callback('PHP upload started...');
    };
    request.upload.onprogress = function(event) {
        callback('PHP upload Progress ' + Math.round(event.loaded / event.total * 100) + "%");
    };
    request.upload.onload = function() {
        callback('progress-about-to-end');
    };
    request.upload.onload = function() {
        callback('PHP upload ended. Getting file URL.');
    };
    request.upload.onerror = function(error) {
        callback('PHP upload failed.');
    };
    request.upload.onabort = function(error) {
        callback('PHP upload aborted.');
    };
    request.open('POST', url);
    request.send(data);
}
function getFileName(fileExtension) {
    var d = new Date();
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth();
    var date = d.getUTCDate();
    return 'recorded-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
}

function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}