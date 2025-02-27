let video;
let yellowPixelCount = 0;
const videoGridSize = 8; // Grid size when video is visible
const hiddenGridSize = 64; // Grid size when video is hidden
let gridSize = videoGridSize; // Current active grid size
let sectionCounts = new Array(videoGridSize * videoGridSize).fill(0);
let hiddenSectionCounts = new Array(hiddenGridSize * hiddenGridSize).fill(0);
let oscillators = []; // Array to store oscillators for each section
let maxPixelCount = 6000; // Cap for normalizing volumes (adjust based on your video)
let audioEnabled = false; // Track audio state
let videoVisible = true; // Track video visibility state

const margin = 5;


function setup() {
  // Create canvas with same dimensions as the video
  createCanvas(642, 650);
  
  // Create video element but don't add it to the DOM
  video = createVideo('video-material/slime-growth_youtube.mp4', videoLoaded);
  video.size(642, 650);
  video.hide(); // Hide the actual HTML video element
  video.elt.muted = true;
  
  // Always create oscillators based on the video grid size (for consistent audio)
  let baseFreq = 220; // A3
  for (let i = 0; i < videoGridSize * videoGridSize; i++) {
    let osc = new p5.Oscillator();
    // Calculate a frequency using pentatonic scale intervals
    // This creates harmonious frequencies when multiple oscillators play together
    let freqMultiplier = [1, 1.125, 1.25, 1.5, 1.6667][i % 5];
    let octaveMultiplier = Math.floor(i / 16) * 0.5 + 1;
    let freq = baseFreq * freqMultiplier * octaveMultiplier;
    
    osc.setType('sine');
    osc.freq(freq);
    osc.amp(0); // Start with volume at 0
    osc.start();
    oscillators.push(osc);
  }
  
  // Set main volume to a lower value to prevent excessive loudness
  outputVolume(0.3);
}

// Toggle audio state
function toggleAudio() {
  audioEnabled = !audioEnabled;
  
  if (audioEnabled) {
    // Resume AudioContext and set volume
    getAudioContext().resume();
    outputVolume(0.3);
  } else {
    // Mute audio
    outputVolume(0);
  }
}

// Toggle visibility state
function toggleVisibility() {
  videoVisible = !videoVisible;
}

function videoLoaded() {
  video.loop();
  video.volume(0);
}

function draw() {
  // Reset section counts for both grid sizes
  sectionCounts.fill(0);
  hiddenSectionCounts.fill(0);
  yellowPixelCount = 0;
  
  // Count yellow pixels
  video.loadPixels(willReadFrequently = true);
  
  const videoSectionWidth = video.width / videoGridSize;
  const videoSectionHeight = video.height / videoGridSize;
  const hiddenSectionWidth = video.width / hiddenGridSize;
  const hiddenSectionHeight = video.height / hiddenGridSize;

  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      // Check if the pixel is yellow
      if (r > 125 && g > 125 && b < 100) {
        yellowPixelCount++;
        
        // Determine which section this pixel belongs to for both grid sizes
        const videoSectionX = Math.floor(x / videoSectionWidth);
        const videoSectionY = Math.floor(y / videoSectionHeight);
        const videoSectionIndex = videoSectionY * videoGridSize + videoSectionX;
        
        const hiddenSectionX = Math.floor(x / hiddenSectionWidth);
        const hiddenSectionY = Math.floor(y / hiddenSectionHeight);
        const hiddenSectionIndex = hiddenSectionY * hiddenGridSize + hiddenSectionX;
        
        // Increment counts for both grid sizes
        sectionCounts[videoSectionIndex]++;
        hiddenSectionCounts[hiddenSectionIndex]++;
      }
    }
  }

  // Draw either the video or the white background with visualization
  if (videoVisible) {
    // Draw the video to the canvas
    image(video, 0, 0, width, height);
    
    // Draw grid lines
    stroke(255); // White lines
    strokeWeight(1); // Thin lines
    
    // Draw vertical lines
    for (let i = 1; i < videoGridSize; i++) {
      const x = i * (width / videoGridSize);
      line(x, 0, x, height);
    }
    
    // Draw horizontal lines
    for (let i = 1; i < videoGridSize; i++) {
      const y = i * (height / videoGridSize);
      line(0, y, width, y);
    }
    
    // Display counters for each section
    textSize(16);
    for (let y = 0; y < videoGridSize; y++) {
      for (let x = 0; x < videoGridSize; x++) {
        const sectionIndex = y * videoGridSize + x;
        const sectionX = x * (width / videoGridSize);
        const sectionY = y * (height / videoGridSize);
        
        // Semi-transparent background for the counter
        fill(0, 0, 0, 100);
        noStroke();
        rect(sectionX + 5, sectionY + 5, 70, 25, 5);
        
        // Text for the counter
        fill(220, 220, 70); // Yellow text
        text(sectionCounts[sectionIndex], sectionX + 10, sectionY + 23);
      }
    }
  } else {
    // Draw white background when video is hidden
    background(255);
    
    // Create visualization based on yellow pixel counts with higher resolution grid
    noStroke();
    const currentSectionWidth = width / hiddenGridSize;
    const currentSectionHeight = height / hiddenGridSize;
    
    for (let y = 0; y < hiddenGridSize; y++) {
      for (let x = 0; x < hiddenGridSize; x++) {
        const sectionIndex = y * hiddenGridSize + x;
        const sectionX = x * currentSectionWidth;
        const sectionY = y * currentSectionHeight;
        
        // Calculate size and color based on pixel count
        const count = hiddenSectionCounts[sectionIndex];
        const maxHiddenPixelCount = maxPixelCount / ((hiddenGridSize * hiddenGridSize) / (videoGridSize * videoGridSize));
        const normalizedCount = map(count, 0, maxHiddenPixelCount, 0, 1);
        const circleSize = map(normalizedCount, 0, 1, 1, currentSectionWidth * 1.5);
        
        // Use yellow with opacity based on count
        fill(240, 220, 0, map(normalizedCount, 0, 1, 50, 255));
        
        // Draw circle in the center of each section
        ellipse(
          sectionX + currentSectionWidth/2, 
          sectionY + currentSectionHeight/2, 
          circleSize, 
          circleSize
        );
      }
    }
  }

  // Update oscillator volumes based on the 8x8 section counts
  for (let i = 0; i < videoGridSize * videoGridSize; i++) {
    // Normalize the count to a value between 0 and 1 for volume control
    // with a cap to prevent excessive loudness
    let normalizedCount = map(sectionCounts[i], 0, maxPixelCount, 0, 0.8);
    normalizedCount = constrain(normalizedCount, 0, 0.8);
    
    // Only play sound if audio is enabled
    if (audioEnabled) {
      // Apply some smoothing to volume changes
      oscillators[i].amp(normalizedCount, 0.1);
    } else {
      oscillators[i].amp(0, 0.1);
    }
  }

  // Always display the total counter at the bottom
  fill(0, 0, 0, 100);
  noStroke();
  rect(5, 650 - 45, 240, 40, 5);
  
  fill(220, 220, 70);
  textSize(24);
  text(`total yellow: ${yellowPixelCount}`, 10, 650 - 17);

  // Always draw the control buttons
  drawAudioButton();
  drawVisibilityButton();
}

function drawAudioButton() {
  const buttonSize = 40;
  const buttonX = width - buttonSize - margin;
  const buttonY = height - buttonSize - margin;
  
  // Draw speaker icon
  fill(220, 220, 70);
  // Speaker base
  rect(buttonX + 11, buttonY + 16, 6, 8);
  // Speaker cone
  beginShape();
  vertex(buttonX + 14, buttonY + 16);
  vertex(buttonX + 19, buttonY + 12);
  vertex(buttonX + 19, buttonY + 28);
  vertex(buttonX + 14, buttonY + 24);
  endShape(CLOSE);
  
  if (!audioEnabled) {
    // X symbol for muted
    stroke(220, 220, 70);
    strokeWeight(2.5);
    line(buttonX + 6, buttonY + 8, buttonX + 28, buttonY + 30);
  } else {
    // Sound waves when unmuted
    stroke(220,220,70);
    strokeWeight(1.5);
    noFill();
    arc(buttonX + 20, buttonY + 20, 10, 14, -PI/3, PI/3);
    arc(buttonX + 21, buttonY + 20, 16, 20, -PI/3, PI/3);
  }
}

function drawVisibilityButton() {
  const buttonSize = 40;
  const buttonX = width - buttonSize - margin;
  const buttonY = height - 2*buttonSize - 2*margin; // Position above audio button
  
  // Draw eye icon
  stroke(220, 220, 70);
  strokeWeight(2.5);
  
  // Create a more pointy eye outline
  fill(220, 220, 70, 50);
  beginShape();
  // Define the eye shape with pointed sides
  const eyeWidth = 24;
  const eyeHeight = 20;
  const centerX = buttonX + buttonSize/2;
  const centerY = buttonY + buttonSize/2;
  
  // Top curve
  vertex(centerX - eyeWidth/2, centerY); // Left point
  bezierVertex(
    centerX - eyeWidth/3, centerY - eyeHeight/2,
    centerX + eyeWidth/3, centerY - eyeHeight/2,
    centerX + eyeWidth/2, centerY  // Right point
  );
  
  // Bottom curve
  bezierVertex(
    centerX + eyeWidth/3, centerY + eyeHeight/2,
    centerX - eyeWidth/3, centerY + eyeHeight/2,
    centerX - eyeWidth/2, centerY  // Back to left point
  );
  
  endShape(CLOSE);
  
  if (videoVisible) {
    // Pupil when visible
    fill(220, 220, 70);
    noStroke();
    ellipse(centerX, centerY, 8, 8);
  } else {
    // Closed eye with line when hidden
    noFill();
    stroke(220, 220, 70);
    strokeWeight(2.5);
    line(centerX - eyeWidth/2 + 4, centerY, centerX + eyeWidth/2 - 4, centerY);
  }
}

function mousePressed() {
  // Check if audio button was clicked
  const buttonSize = 40;
  const audioButtonX = width - buttonSize - margin;
  const audioButtonY = height - buttonSize - margin;
  
  const audioD = dist(mouseX, mouseY, audioButtonX + buttonSize/2, audioButtonY + buttonSize/2);
  if (audioD < buttonSize/2) {
    toggleAudio();
    return false; // Prevent default behavior
  }
  
  // Check if visibility button was clicked
  const visButtonX = width - buttonSize - margin;
  const visButtonY = height - 2*buttonSize - 2*margin;
  
  const visD = dist(mouseX, mouseY, visButtonX + buttonSize/2, visButtonY + buttonSize/2);
  if (visD < buttonSize/2) {
    toggleVisibility();
    return false; // Prevent default behavior
  }
}