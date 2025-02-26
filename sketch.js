let video;
let yellowPixelCount = 0;
const gridSize = 5; // 4x4 grid
let sectionCounts = new Array(gridSize * gridSize).fill(0);

function setup() {
  // Create canvas with same dimensions as the video
  createCanvas(642, 650);
  
  // Create video element but don't add it to the DOM
  video = createVideo('video-material/slime-growth_youtube.mp4', videoLoaded);
  video.size(642, 650);
  video.hide(); // Hide the actual HTML video element
  video.elt.muted = true;
}

function videoLoaded() {
  video.loop();
  video.volume(0);
}

function draw() {
  // Draw the video to the canvas
  image(video, 0, 0, width, height);
  
  // Reset section counts
  sectionCounts.fill(0);
  yellowPixelCount = 0;
  
  // Count yellow pixels
  video.loadPixels();
  
  const sectionWidth = video.width / gridSize;
  const sectionHeight = video.height / gridSize;

  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      // Check if the pixel is yellow
      if (r > 125 && g > 125 && b < 100) {
        yellowPixelCount++;
        
        // Determine which section this pixel belongs to
        const sectionX = Math.floor(x / sectionWidth);
        const sectionY = Math.floor(y / sectionHeight);
        const sectionIndex = sectionY * gridSize + sectionX;
        
        // Increment the count for this section
        sectionCounts[sectionIndex]++;
      }
    }
  }

  // Draw grid lines
  stroke(255); // White lines
  strokeWeight(1); // Thin lines
  
  // Draw vertical lines
  for (let i = 1; i < gridSize; i++) {
    const x = i * (width / gridSize);
    line(x, 0, x, height);
  }
  
  // Draw horizontal lines
  for (let i = 1; i < gridSize; i++) {
    const y = i * (height / gridSize);
    line(0, y, width, y);
  }
  
  // Display counters for each section
  textSize(16);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const sectionIndex = y * gridSize + x;
      const sectionX = x * (width / gridSize);
      const sectionY = y * (height / gridSize);
      
      // Semi-transparent background for the counter
      fill(0, 0, 0, 150);
      noStroke();
      rect(sectionX + 5, sectionY + 5, 70, 25, 5);
      
      // Text for the counter
      fill(220, 220, 70); // Yellow text
      text(sectionCounts[sectionIndex], sectionX + 10, sectionY + 23);
    }
  }

  // Display the total counter at the bottom
  fill(0, 0, 0, 100);
  noStroke();
  rect(5, 650 - 45, 240, 40, 5);
  
  fill(220, 220, 70);
  textSize(24);
  text(`Total Yellow: ${yellowPixelCount}`, 10, 650 - 17);
}