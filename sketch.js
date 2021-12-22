// ************************************************
// Madelbrot Set
// Horribly coded by : Kevin Le Teugg, 2021
// File : sketch.js
// Description :
// ************************************************

// CONSTANTS
let CANVAS_WIDTH = 600; // Default 800
let CANVAS_HEIGHT = 600; // Default 600
let PLOT_X_MIN = -2; // Default -2
let PLOT_X_MAX = 1;  // Default 1
let PLOT_Y_MIN = -2; // Default -1
let PLOT_Y_MAX = 2;  // Default 1
// GLOBAL VARIABLES
let realRange;
let imagRange;
let realC;
let imagC;
let compCMag;
let iterationsThreshMax = 30;
let iterationsThreshDefault = 20;
//let magThresh = 0.1; // Default 0.0000001
let magThreshMax = 200;
let magThreshDefault = 1;
let magThreshDivider = 10000 // Since the slider can only accept ints
let deltaIteration = 0;
let compCMagPrevious = 0;
let debugObj = [];
let reZ = 0;
let imZ = 0;
let zeroX = 0;
let zeroPixelX = 0;
let zeroY = 0;
let zeroPixelY = 0;
let gridPoints = [];

// Assets preload
function preload() {

}

function setup() {
  // Canvas creation
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  //canvas.parent('sketch-holder');
  background(60);

  // DOM ELEMENTS
  drawButton = createButton('Draw');
  drawButton.position(CANVAS_WIDTH / 2, CANVAS_HEIGHT - (drawButton.height / 2));

  clearButton = createButton('Clear');
  clearButton.position((CANVAS_WIDTH / 2) + drawButton.width, CANVAS_HEIGHT - (drawButton.height / 2));

  toggleGridButton = createButton('Grid');
  toggleGridButton.position(CANVAS_WIDTH / 2, CANVAS_HEIGHT + 50);

  iterationsSliderP = createP('# of iter. for each C');
  iterationsSliderP.style('font-size', '16px');
  iterationsSliderP.position(20, 20);

  iterationsSliderValueP = createP(iterationsThreshDefault);
  iterationsSliderValueP.style('font-size', '16px');
  iterationsSliderValueP.position(20, 40);

  iterationsSlider = createSlider(1, iterationsThreshMax, iterationsThreshDefault);
  iterationsSlider.position(20, 80);
  iterationsSlider.style('width', '160px');
  iterationsSlider.mouseClicked(getIterationsSliderValue);

  iterationsSliderP = createP('Mag. max to be in set');
  iterationsSliderP.style('font-size', '16px');
  iterationsSliderP.position(20, 100);

  magThreshSliderValueP = createP(magThreshDefault / magThreshDivider);
  magThreshSliderValueP.style('font-size', '16px');
  magThreshSliderValueP.position(20, 120);

  magThreshSlider = createSlider(1, magThreshMax, magThreshDefault);
  magThreshSlider.position(20, 160);
  magThreshSlider.style('width', '160px');
  magThreshSlider.mouseClicked(getMagThreshSliderValue);

  calculatingStatusP = createP('No calculation yet');
  calculatingStatusP.style('font-size', '16px');
  calculatingStatusP.position(CANVAS_WIDTH - 150, 40);

  drawButton.mousePressed(calculateMandelbrot);
  toggleGridButton.mousePressed(toggleGrid);
  clearButton.mousePressed(clearScreen);
}

// p5.js animation loop
function draw() {

}	

function getIterationsSliderValue() {
  iterationsSliderValueP.elt.innerText = iterationsSlider.value();
}

function getMagThreshSliderValue() {
  magThreshSliderValueP.elt.innerText = magThreshSlider.value() / magThreshDivider;
}

function toggleGrid() {
  if (gridPoints.length !== 0) {
    for (i = 0; i < gridPoints.length; i++) {
      stroke(0, 0, 200);
      strokeWeight(2);
      point(gridPoints[i].x, gridPoints[i].y);
    }
  } else {
    alert("Draw a figure first");
  }
}

function clearScreen() {
  clear();
  background(60);
}

function calculateMandelbrot() {
  console.log('Calculating');
  background(60);
  // Refactor this later
  if (PLOT_X_MIN < 0 && PLOT_X_MAX < 0) {
    realRange = Math.abs(Math.abs(PLOT_X_MIN) - Math.abs(PLOT_X_MAX));
  }
  if (PLOT_X_MIN < 0 && PLOT_X_MAX > 0) {
    realRange = Math.abs(Math.abs(PLOT_X_MIN) + Math.abs(PLOT_X_MAX));
    zeroX = (PLOT_X_MAX - PLOT_X_MIN) / 2;
    zeroPixelX = (Math.abs(PLOT_X_MIN) * CANVAS_WIDTH) / realRange;
  }
  if (PLOT_X_MIN > 0 && PLOT_X_MAX > 0) {
    realRange = Math.abs(Math.abs(PLOT_X_MAX) - Math.abs(PLOT_X_MIN));
  }
  if (PLOT_Y_MIN < 0 && PLOT_Y_MAX < 0) {
    imagRange = Math.abs(Math.abs(PLOT_Y_MIN) - Math.abs(PLOT_Y_MAX));
  }
  if (PLOT_X_MIN < 0 && PLOT_X_MAX > 0) {
    imagRange = Math.abs(Math.abs(PLOT_Y_MIN) + Math.abs(PLOT_Y_MAX));
  }
  if (PLOT_X_MIN > 0 && PLOT_X_MAX > 0) {
    imagRange = Math.abs(Math.abs(PLOT_Y_MAX) - Math.abs(PLOT_Y_MIN));
  }

  // Vertical axis
  stroke(255);
  line(zeroPixelX, 0, zeroPixelX, CANVAS_HEIGHT);
  
  for (i = 0; i <= CANVAS_WIDTH; i++) {
    for (j = 0; j <= CANVAS_HEIGHT; j++) {
      // MAPPING CANVAS PIXELS DIMENSIONS INTO PLOT DIMENSIONS
      realC = (i * (realRange / CANVAS_WIDTH)) - Math.abs(PLOT_X_MIN);
      imagC = (j * (imagRange / CANVAS_HEIGHT)) - Math.abs(PLOT_Y_MIN);
      reZ = realC;
      imZ = imagC;
      // GET COORDINATES
      if (i % 10 == 0 && j % 10 == 0) {
        // stroke(0, 0, 200);
        // strokeWeight(1);
        // textSize(8);
        // text(Math.round(realC * 100) / 100 + ' ; ' + Math.round(imagC * 100) / 100, i, j);
        // stroke(200, 0, 200);
        // strokeWeight(5);
        // point(i, j);
        gridPoints.push({x:i, y:j});
      }
      for (k = 0; k < iterationsSlider.value(); k++) {
        // OLD METHOD THAT DIDN'T WORK BUT IS COOL
        // realC += (realC * realC) - (imagC * imagC);
        // imagC += (2 * realC * imagC);
        // INSERT FORMULA HERE + IF STATEMENT IF MAGNITUDE OF NUMBER IS TOO BIG
        reZ = (reZ * reZ) - (imZ * imZ) + realC;
        imZ = (2 * reZ * imZ) + imagC;
        compCMag = sqrt((reZ * reZ) + (imZ * imZ));
        deltaIteration = Math.abs(Math.abs(compCMagPrevious) - Math.abs(compCMag));
        if (compCMag >= 2) {
          break;
        }
        if (k === iterationsSlider.value() - 1) {
          if (deltaIteration < magThreshSlider.value() / magThreshDivider) {
            stroke(0, 0, 0);
            point(i, j);
          }
          if (deltaIteration >= magThreshSlider.value() / magThreshDivider && deltaIteration < 10 * magThreshSlider.value() / magThreshDivider) {
            stroke(0, 200, 0);
            point(i, j);
          }
          if (deltaIteration >= 10 * magThreshSlider.value() / magThreshDivider && deltaIteration < 100 * magThreshSlider.value() / magThreshDivider) {
            stroke(0, 0, 200);
            point(i, j);
          }
        }
      }
      compCMagPrevious = compCMag;
    }
  }
  console.log('Calculation done !');
  calculatingStatusP.elt.innerText = 'Calculation done !';

  // SIMPLE EXAMPLE - WORKING
  // let reC = 0.3;
  // let imC = 0.2;
  // for (k = 0; k < 40; k++) {
  //   reC += (reC * reC) - (imC * imC);
  //   imC += 2 * reC * imC;
  //   magC = sqrt((reC * reC) + (imC * imC));
  //   console.log(magC);
  // }
}