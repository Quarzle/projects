let input = document.getElementById("fileInput");

input.addEventListener("change", function (e) {
    let image_file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image_file);

    reader.onload = (event) => {
        let image_url = event.target.result;
        let image = document.createElement("img");
        image.src = image_url;

        image.onload = () => {
            let canvas = document.getElementById("canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            // Apply box blur filter
            let originalData = new Uint8ClampedArray(data);

            let width = canvas.width;
            let height = canvas.height;
            let kernelSize = 5;
            let half = Math.floor(kernelSize / 2);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let r = 0, g = 0, b = 0, count = 0;

                    for (let ky = -half; ky <= half; ky++) {
                        for (let kx = -half; kx <= half; kx++) {
                            let px = x + kx;
                            let py = y + ky;

                            if (px >= 0 && px < width && py >= 0 && py < height) {
                                let index = (py * width + px) * 4;
                                r += originalData[index];
                                g += originalData[index + 1];
                                b += originalData[index + 2];
                                count++;
                            }
                        }
                    }

                    let i = (y * width + x) * 4;
                    data[i] = r / count;
                    data[i + 1] = g / count;
                    data[i + 2] = b / count;
                    // Preserve alpha channel
                    data[i + 3] = originalData[i + 3];
                }
            }

            // draw the filtered image to the canvas
            ctx.putImageData(imageData, 0, 0);
        }
    }
});