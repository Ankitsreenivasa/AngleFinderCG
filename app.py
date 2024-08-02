from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import cv2
import numpy as np
import math

# Create the Flask app
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    # Handle image upload
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        return jsonify({'filepath': file_path})

@app.route('/calculate_angle', methods=['POST'])
def calculate_angle():
    # Handle angle calculation
    data = request.json
    points = data['points']
    image_path = data['image_path']

    if len(points) < 3:
        return jsonify({'error': 'Insufficient points'})

    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        return jsonify({'error': 'Unable to load image'})

    # Calculate angle
    def calculate_angle(pt1, pt2, pt3):
        vector1 = np.array(pt2) - np.array(pt1)
        vector2 = np.array(pt3) - np.array(pt1)

        dot_product = np.dot(vector1, vector2)
        magnitude1 = np.linalg.norm(vector1)
        magnitude2 = np.linalg.norm(vector2)

        if magnitude1 == 0 or magnitude2 == 0:
            return 0

        cos_theta = dot_product / (magnitude1 * magnitude2)
        angle_rad = math.acos(np.clip(cos_theta, -1.0, 1.0))
        angle_deg = math.degrees(angle_rad)

        return angle_deg

    angle = calculate_angle(points[0], points[1], points[2])

    return jsonify({'angle': angle})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # Serve the uploaded image
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)