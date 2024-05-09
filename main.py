from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import os
import cv2
import numpy as np
import base64
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/record_video', methods=['POST'])
def record_video():
    # Handle video recording logic here
    # For now, just return a success message
    return jsonify({'message': 'Video recorded successfully'})

@socketio.on('video_frame')
def handle_video_frame(frame):
    # Convert the base64-encoded frame to a numpy array
    frame_bytes = base64.b64decode(frame)
    frame_np = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame_decoded = cv2.imdecode(frame_np, cv2.IMREAD_COLOR)

    # Save the frame as an image
    timestamp = int(time.time())
    cv2.imwrite(f"frame_{timestamp}.jpg", frame_decoded)

    # Emit a response to the client
    emit('frame_saved', {'timestamp': timestamp})

if __name__ == '__main__':
    socketio.run(app, debug=True)