// This is a simple script to create favicon icons for the PWA
// You would run this separately, not in the browser
/*
// Example usage (with Node.js and canvas):
const { createCanvas } = require('canvas');
const fs = require('fs');

// Function to create a simple icon
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#2563eb'; // Blue background
  ctx.fillRect(0, 0, size, size);
  
  // Soccer ball (simplified)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Pattern on the ball
  ctx.strokeStyle = 'black';
  ctx.lineWidth = size / 20;
  ctx.beginPath();
  ctx.moveTo(size / 2 - size / 10, size / 2 - size / 6);
  ctx.lineTo(size / 2 + size / 10, size / 2 - size / 6);
  ctx.stroke();
  
  return canvas.toBuffer('image/png');
}

// Create icons
const sizes = [192, 512];
sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  if (!fs.existsSync('./icons')) {
    fs.mkdirSync('./icons');
  }
  fs.writeFileSync(`./icons/icon-${size}x${size}.png`, iconBuffer);
  console.log(`Created icon-${size}x${size}.png`);
});
*/ 