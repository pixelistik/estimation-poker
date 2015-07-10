from flask import Flask, render_template, send_from_directory, session
from flask.ext.socketio import SocketIO, emit, join_room
import os
import pystache

template_dir = os.path.abspath("../client")
app = Flask(__name__, template_folder=template_dir)
app.config["SECRET_KEY"] = "b8weH7evX6ELU0Dy540zgrIt"
app.debug = True
socketio = SocketIO(app)

@app.route("/")
def index():
    with open ("../client/index.html", "r") as indexfile:
        template = indexfile.read()
    return pystache.render(template, {"productionMode": True})

@app.route("/<path:path>")
def send_js(path):
    return send_from_directory("../client/", path)

@socketio.on("join")
def join(data):
    app.logger.debug(data)

    session["group"] = data["groupName"]
    session["userUuid"] = data["userUuid"]

    app.logger.debug(session)

    join_room(session["group"])
    emit("who is there", room=session["group"])

@socketio.on("update")
def update(data):
    app.logger.debug(data)
    emit("update", data, room=session["group"])

@socketio.on("disconnect")
def disconnect():
    emit("user disconnected", session["userUuid"], room=session["group"])

if __name__ == "__main__":
    socketio.run(app)