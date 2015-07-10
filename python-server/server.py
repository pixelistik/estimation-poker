from flask import Flask, render_template, send_from_directory, send_file, session
from flask.ext.socketio import SocketIO, emit, join_room
import os
import pystache
import json

with open ("../package.json", "r") as packageFile:
    packageInfo = json.load(packageFile)

template_dir = os.path.abspath("../client")
app = Flask(__name__, template_folder=template_dir)
app.config["SECRET_KEY"] = "b8weH7evX6ELU0Dy540zgrIt"
socketio = SocketIO(app)

indexData = {
    "packageInfo": packageInfo
}

if os.environ.has_key("PIWIK_URL") and os.environ.has_key("PIWIK_SITE_ID"):
    indexData["piwik"] = {
        "url": os.environ["PIWIK_URL"],
        "siteId": os.environ["PIWIK_SITE_ID"]
    }

if os.environ.has_key("PRODUCTION_MODE") and os.environ["PRODUCTION_MODE"] == "1":
    indexData["productionMode"] = True
else:
    indexData["productionMode"] = False

@app.route("/")
def index():
    with open ("../client/index.html", "r") as indexfile:
        template = indexfile.read()
    return pystache.render(template, indexData)

@app.route("/js/lib/socket.io.js")
def send_socketio_js():
    return send_file("../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js")

@app.route("/<path:path>")
def send_assets(path):
    return send_from_directory("../client/", path)

@socketio.on("join")
def join(data):
    session["group"] = data["groupName"]
    session["userUuid"] = data["userUuid"]

    join_room(session["group"])
    emit("who is there", room=session["group"])

@socketio.on("update")
def update(data):
    emit("update", data, room=session["group"])

@socketio.on("disconnect")
def disconnect():
    emit("user disconnected", session["userUuid"], room=session["group"])

if __name__ == "__main__":
    socketio.run(app)
