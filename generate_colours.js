// Function to generate a random hue (0-360 degrees on the color wheel)
  function getRandomHue() {
    return Math.floor(Math.random() * 360);
  }

  // Function to convert HSL to RGB
  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Function to generate an analogous color palette
  function generateAnalogousPalette(numColors) {
    const baseHue = getRandomHue();
    const palette = [];
    
    // Generate the analogous colors by adjusting the hue slightly
    for (let i = 0; i < numColors; i++) {
      const hueOffset = (i - Math.floor(numColors / 2)) * 80; // Adjust the hue to make them analogous
      const hue = (baseHue + hueOffset + 360) % 360; // Wrap around the hue to stay within 0-360 range
      const color = hslToRgb(hue, 90, 75); // Use a fixed saturation (80) and lightness (60) for consistency
      palette.push(color);
    }

    return palette;
  }

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getOppositeColorRGB(colour) {
    // Remove the '#' from the beginning of the color hex string
    colour = colour.substring(1);
    
    // Convert the hex to RGB
    var r = parseInt(colour.substring(0, 2), 16);
    var g = parseInt(colour.substring(2, 4), 16);
    var b = parseInt(colour.substring(4, 6), 16);

    // Calculate the opposite (complementary) color by subtracting each component from 255
    var oppositeR = 255 - r;
    var oppositeG = 255 - g;
    var oppositeB = 255 - b;

    // Convert the RGB components back to hex and ensure each is two digits
    var oppositeHex = "#" + 
        oppositeR.toString(16).padStart(2, '0') + 
        oppositeG.toString(16).padStart(2, '0') + 
        oppositeB.toString(16).padStart(2, '0');

    // Return the opposite color in hex format
    return oppositeHex.toUpperCase(); // Make it uppercase for consistency
}