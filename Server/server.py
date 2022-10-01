from flask import Flask, request
from flask_cors import CORS
import os
from utils import allowed_file
from werkzeug.utils import secure_filename


class WebUI:
    def __init__(self, name, host='0.0.0.0', port='8080'):
        self.app = Flask(name)
        self.host = host
        self.port = port
        self.app.config["TEMPLATES_AUTO_RELOAD"] = True
        self.cors = CORS(self.app)
        self.app.config['MAX_CONTENT_LENGTH'] = 1024 * 1000 * 1000
        self.ALLOWED = ['webm']
    
        @self.app.route('/')
        def __index():
            return self.index()

        @self.app.route('/upload', methods=['POST'])
        def __upload():
            return self.upload()

    def index(self):
        return "WebUI works!"

    def upload(self):
        if 'video-blob' in request.files:
            video = request.files['video-blob']
            if video.filename:
                if video and allowed_file(video.filename, self.ALLOWED):
                    filename = secure_filename(video.filename)
                    video.save(os.path.join("uploaded_videos", filename))
                    return "OK; Uploaded"
        return "Error"
    
    def run(self):
        self.app.run(host=self.host, port=self.port)

if __name__ == "__main__":
    web = WebUI(__name__)
    web.run()
