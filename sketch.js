// ************************************************
// Madelbrot Set
// Horribly coded by : Kevin Le Teugg, 2021
// File : sketch.js
// Description :
// ************************************************

// CONSTANTS
let CANVAS_WIDTH = 600; // Default 600
let CANVAS_HEIGHT = 600; // Default 600
let PLOT_X_MIN = -2; // Default -2
let PLOT_X_MAX = 1;  // Default 1
let PLOT_Y_MIN = -2; // Default -1
let PLOT_Y_MAX = 2;  // Default 1

// GLOBAL VARIABLES
// Ranges bases on the plot x min/max and y min/max
let realRange;
let imagRange;
// Variables used for calculating Mandelbrot set
let reC;
let imC;
let reZ = 0;
let imZ = 0;
let magZ;
let prevReZ = 0;
let prevImZ = 0;
let prevMagZ = 0;
// Stocking Mandelbrot set values
let mandelPixelPoints = [];
// Variables for iterations slider
let iterationsThreshMax = 50;
let iterationsThreshDefault = 20;
// Variables used for magnitude threshold slider
// (used for rejecting some C that have a certain magnitude out of the Mandelbrot set)
let magThreshMax = 2000;
let magThreshDefault = 2000;
let magThreshDivider = 1000 // Since the slider can only accept ints
// Used for comparing the magnitudes of two consecutive iterations (gives an idea of convergence)
let deltaIteration = 0;
// Used to draw x=0 and y=0 axes based on plot x min/max and y min/max
let zeroX = 0;
let zeroPixelX = 0;
let zeroY = 0;
let zeroPixelY = 0;
// Used for toggling the grid
let gridPoints = [];

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
  iterationsSliderP.position(20, 30);

  iterationsSliderValueP = createP(iterationsThreshDefault);
  iterationsSliderValueP.style('font-size', '16px');
  iterationsSliderValueP.position(20, 50);

  iterationsSlider = createSlider(1, iterationsThreshMax, iterationsThreshDefault);
  iterationsSlider.position(20, 90);
  iterationsSlider.style('width', '160px');
  iterationsSlider.mouseClicked(getIterationsSliderValue);

  iterationsSliderP = createP('Mag. max to be in set');
  iterationsSliderP.style('font-size', '16px');
  iterationsSliderP.position(20, 110);

  calcSelectCB = createCheckbox('Magnitude selection', false);
  calcSelectCB.position(20, 150);
  calcSelectCB.changed(calcSelect);

  magThreshSliderValueP = createP(magThreshDefault / magThreshDivider);
  magThreshSliderValueP.style('font-size', '16px');
  magThreshSliderValueP.position(20, 160);

  magThreshSlider = createSlider(1, magThreshMax, magThreshDefault);
  magThreshSlider.position(20, 200);
  magThreshSlider.style('width', '160px');
  magThreshSlider.mouseClicked(getMagThreshSliderValue);

  // calculatingStatusP = createP('No calculation yet');
  // calculatingStatusP.style('font-size', '16px');
  // calculatingStatusP.position(CANVAS_WIDTH - 150, 40);

  drawButton.mousePressed(calculateMandelbrot);
  toggleGridButton.mousePressed(toggleGrid);
  clearButton.mousePressed(clearScreen);
}

// p5.js animation loop
function draw() {
  //calculateMandelbrot(); Try to animate this bad boy later
  //mandelPixelPoints.forEach(element => point(element.x, element.y));
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

function calcSelect() {
  if (this.checked()) {
    console.log('Checking!');
  } else {
    console.log('Unchecking!');
  }
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
      reC = (i * (realRange / CANVAS_WIDTH)) - Math.abs(PLOT_X_MIN);
      imC = (j * (imagRange / CANVAS_HEIGHT)) - Math.abs(PLOT_Y_MIN);
      // ReZ = reC;
      // imZ = imC;
      prevReZ = reC;
      prevImZ = imC;
      // GET COORDINATES
      if (i % 10 == 0 && j % 10 == 0) {
        // stroke(0, 0, 200);
        // strokeWeight(1);
        // textSize(8);
        // text(Math.round(reC * 100) / 100 + ' ; ' + Math.round(imC * 100) / 100, i, j);
        // stroke(200, 0, 200);
        // strokeWeight(5);
        // point(i, j);
        gridPoints.push({x:i, y:j});
      }
      for (k = 0; k < iterationsSlider.value(); k++) {
        // OLD METHOD THAT DIDN'T WORK BUT IS COOL
        // reC += (reC * reC) - (imC * imC);
        // imC += (2 * reC * imC);
        // 2ND OLD METHOD
        // reZ = (reZ**2) - (imZ**2) + reC;
        // imZ = (2 * reZ * imZ) + imC;
        // INSERT FORMULA HERE + IF STATEMENT IF MAGNITUDE OF NUMBER IS TOO BIG

        reZ = (prevReZ**2) - (prevImZ**2) + reC;
        imZ = (2 * prevReZ * prevImZ) + imC;
        prevReZ = reZ;
        prevImZ = imZ;
        magZ = sqrt((reZ**2) + (imZ**2));
        deltaIteration = Math.abs(Math.abs(prevMagZ) - Math.abs(magZ));

        if (magZ >= 2) {
          break;
        }
        // FOR NOW, WE BREAK FROM LOOP IF MAG(Z) GOES ABOVE 2 BUT WE WILL GET RID OF THIS AND PUT A CONDITION HERE FOR COLOURING
        // THE SPACE AROUND THE MANDELBROT SET
        if (k === iterationsSlider.value() - 1 && magZ < 2) {
          if (deltaIteration < magThreshSlider.value() / magThreshDivider) {
            stroke(0, 0, 0);
            point(i, j);
            mandelPixelPoints.push({x:i, y:j});
          }
          // if (deltaIteration >= magThreshSlider.value() / magThreshDivider && deltaIteration < 10 * magThreshSlider.value() / magThreshDivider) {
          //   stroke(0, 200, 0);
          //   point(i, j);
          // }
          // if (deltaIteration >= 10 * magThreshSlider.value() / magThreshDivider && deltaIteration < 100 * magThreshSlider.value() / magThreshDivider) {
          //   stroke(0, 0, 200);
          //   point(i, j);
          // }
        }
      }
      prevMagZ = magZ;
    }
  }
  console.log('Calculation done !');
  //calculatingStatusP.elt.innerText = 'Calculation done !';
}