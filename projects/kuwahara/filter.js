let input = document.getElementById("fileInput");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function applyKuwaharaFilter(image) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    let width = canvas.width;
    let height = canvas.height;

    let originalData = new Uint8ClampedArray(data);
    let radius = 2;

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            let regions = [[], [], [], []];

            for (let dy = -radius; dy <= 0; dy++) {
                for (let dx = -radius; dx <= 0; dx++) {
                    let i = ((y + dy) * width + (x + dx)) * 4;
                    regions[0].push(originalData.slice(i, i + 3));
                }
            }
            for (let dy = -radius; dy <= 0; dy++) {
                for (let dx = 0; dx <= radius; dx++) {
                    let i = ((y + dy) * width + (x + dx)) * 4;
                    regions[1].push(originalData.slice(i, i + 3));
                }
            }
            for (let dy = 0; dy <= radius; dy++) {
                for (let dx = -radius; dx <= 0; dx++) {
                    let i = ((y + dy) * width + (x + dx)) * 4;
                    regions[2].push(originalData.slice(i, i + 3));
                }
            }
            for (let dy = 0; dy <= radius; dy++) {
                for (let dx = 0; dx <= radius; dx++) {
                    let i = ((y + dy) * width + (x + dx)) * 4;
                    regions[3].push(originalData.slice(i, i + 3));
                }
            }

            let minVariance = Infinity;
            let finalColor = [0, 0, 0];

            for (let region of regions) {
                let sum = [0, 0, 0];
                let mean = [0, 0, 0];
                let variance = [0, 0, 0];

                for (let pixel of region) {
                    for (let c = 0; c < 3; c++) {
                        sum[c] += pixel[c];
                    }
                }
                let n = region.length;
                for (let c = 0; c < 3; c++) {
                    mean[c] = sum[c] / n;
                }

                for (let pixel of region) {
                    for (let c = 0; c < 3; c++) {
                        variance[c] += Math.pow(pixel[c] - mean[c], 2);
                    }
                }

                let totalVariance = variance[0] + variance[1] + variance[2];

                if (totalVariance < minVariance) {
                    minVariance = totalVariance;
                    finalColor = mean;
                }
            }

            let index = (y * width + x) * 4;
            data[index] = finalColor[0];
            data[index + 1] = finalColor[1];
            data[index + 2] = finalColor[2];
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Load default image on page load
window.addEventListener("DOMContentLoaded", () => {
    let defaultImage = new Image();
    defaultImage.src = "kuwahara_example.jpg"; // Make sure this image is in the correct path

    defaultImage.onload = () => {
        applyKuwaharaFilter(defaultImage);
    };
});

// File input change handler
input.addEventListener("change", function (e) {
    let image_file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(image_file);

    reader.onload = (event) => {
        let image_url = event.target.result;
        let image = new Image();
        image.src = image_url;

        image.onload = () => {
            applyKuwaharaFilter(image);
        };
    };
});
