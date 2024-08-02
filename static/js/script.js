document.addEventListener("DOMContentLoaded", function () {
    const uploadForm = document.getElementById("uploadForm");
    const imageInput = document.getElementById("imageInput");
    const uploadedImage = document.getElementById("uploadedImage");
    const canvas = document.getElementById("canvas");
    const angleResult = document.getElementById("angleResult");

    let points = [];
    let imagePath = "";

    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        fetch("/upload", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                imagePath = data.filepath;
                uploadedImage.src = `/uploads/${imageInput.files[0].name}`;
                uploadedImage.style.display = "block";
                points = [];
                angleResult.textContent = "";

                // Load the image onto the canvas
                uploadedImage.onload = () => {
                    const context = canvas.getContext("2d");
                    canvas.width = uploadedImage.width;
                    canvas.height = uploadedImage.height;
                    context.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
                    canvas.style.display = "block";
                };
            });
    });

    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const context = canvas.getContext("2d");

        // Draw a circle at the clicked point
        context.fillStyle = "red";
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();

        points.push([x, y]);

        // Draw lines between points
        if (points.length > 1) {
            context.strokeStyle = "red";
            context.beginPath();
            context.moveTo(points[points.length - 2][0], points[points.length - 2][1]);
            context.lineTo(x, y);
            context.stroke();
        }

        if (points.length === 3) {
            // Calculate angle when three points are selected
            fetch("/calculate_angle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    points: points,
                    image_path: imagePath,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    angleResult.textContent = `Angle: ${data.angle.toFixed(2)}°`;
                    points = [];
                    context.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
                });
        }
    });
});