/**
 * Creating the digital rain effect as seen in The Matrix films in p5.js
 * 
 * Author: Scott Ranken
 * Created: 2025-04-14
 *
 * Description
 * Overview: The rain effect is achieved by manipulating the alpha values of each symbol. 
 *           All of the symbols are created in setup and do not move.
 *
 * Streams:  Each stream contains twenty five symbols positioned down the canvas Y axis.  
 *           Twenty streams are created along the canvas X axis which populates the entire
 *           400x400 canvas. It is within the Stream class that the main rain effect is
 *           achieved using an alpha trailing effect. See updateStreamRGBA() & updateStreamAlphaTrail()
 *          
 * Symbols:  Each symbol contains its own properties: x, y, RGB, alpha etc. Symbols are set
 *           to Katakana characters and have a random chance of changing. There is also a
 *           random chance that the first symbol in a stream will be coloured white.
 */

const maxStreams             = 20;
const canvasX                = 400;
const canvasY                = 400;
const symbolSize             = 20;
const streamLength           = 25;
const alphaTrailLengthStart  = 17;
const alphaTrailLengthEnd    = 23;

let matrixStream             = [];

class Symbols {
  constructor(x, y, character, whiteSymbolStream, randomiseChar, symbolR, symbolG, symbolB, symbolAlpha) {
    this.x                   = x;
    this.y                   = y;
    this.character           = character;
    this.whiteSymbolStream   = whiteSymbolStream;
    this.randomiseChar       = randomiseChar;
    this.symbolR             = symbolR;
    this.symbolG             = symbolG;
    this.symbolB             = symbolB;
    this.symbolAlpha         = symbolAlpha;
    
    // Set the update time for next character change.
    this.setNextUpdateTime();
    
    // Set a random glow strength for each symbol.
    this.shadowBlur = random(5, 15);
  }

  // Gets the time interval before a symbol changes. 
  getRandomCharacterTimerMS() {
    if (this.whiteSymbolStream) {
        return random(350, 750);
    }
    return random(500, 2000);
  }
  
  // Sets the next time this symbol will change character.
  setNextUpdateTime() {
    this.nextUpdateTime = millis()+this.getRandomCharacterTimerMS();
  }

  // Updates the symbol's character.
  updateCharacter() {
    if (!this.whiteSymbolStream && !this.randomiseChar) {
      return;
    }
    
    const currentTime = millis();
    if (currentTime >= this.nextUpdateTime) {
      this.character = getRandomKatakanaChar();
      this.setNextUpdateTime();
    }
  }
  
  // Updates the RGB values of the symbol.
  setSymbolRGB(r, g, b) {
    this.symbolR = r;
    this.symbolG = g;
    this.symbolB = b;
  }

  // Renders the symbol on the canvas with a glow effect.
  render() {
    drawingContext.shadowBlur = this.shadowBlur;
    drawingContext.shadowColor = color(this.symbolR, this.symbolG, this.symbolB);
    
    textSize(symbolSize);
    fill(this.symbolR, this.symbolG, this.symbolB, this.symbolAlpha);
    text(this.character, this.x, this.y);

    drawingContext.shadowBlur = 0;
  }
}

class Stream {
  constructor(streamID) {
    let streamX             = streamID * symbolSize;
    this.whiteSymbolStream  = random() <= 0.33; // 33% chance the stream starts with a white symbol

    this.stream             = [];

    for (let i = 0; i < streamLength; i++) { 
      let symbolR           = 0;
      let symbolG           = 255;
      let symbolB           = 65;
      let symbolAlpha       = 0;
      let randomiseChar     = random() <= 0.5; // 50% chance of symbol being allowed to change character

      this.stream.push(new Symbols(
        streamX, 
        (i*symbolSize), 
        getRandomKatakanaChar(), 
        this.whiteSymbolStream, 
        randomiseChar, 
        symbolR, 
        symbolG, 
        symbolB, 
        symbolAlpha));
    }
    
    // Initialise the alpha trail properties for this stream.
    this.alphaTrailLength   = int(random(alphaTrailLengthStart, alphaTrailLengthEnd));
    this.alphaSpeedMS       = this.getAlphaSpeedMS();
    this.alphaPeakIndex     = streamLength*2;
    this.lastAlphaUpdate    = millis();
    this.resetDelay         = int(random(0, 4000));
    this.resetStartTime     = 0;
    this.isResetting        = false;
  }

  // Returns the speed of the alpha trail effect.
  getAlphaSpeedMS() {
    if (this.whiteSymbolStream) {
        return random(40, 50);
    }
    return random(45, 55);
  }

  // Updates the symbol's RGBA values based on alpha trail position.
  updateStreamRGBA(symbol, i) {
    const distanceFromPeak = this.alphaPeakIndex-i;

    if (distanceFromPeak >= 0 && distanceFromPeak < this.alphaTrailLength) {
      symbol.symbolAlpha = map(distanceFromPeak, 0, this.alphaTrailLength-1, 255, 0);

      if (distanceFromPeak === 0 && this.whiteSymbolStream) {
        symbol.setSymbolRGB(255, 255, 255);
      } else {
        symbol.setSymbolRGB(0, 255, 65);
      }
    } else {
      symbol.symbolAlpha = 0;
    }
  }

  // Controls the movement of the alpha trail through the stream.
  // Updates the alpha values of the symbols in the stream based on their position to the
  // current alpha peak index. When the alpha peak index reaches the end of the stream it resets 
  // and randomly adjusts the trail's length, speed, and delay so it isn't identical every cycle.
  updateStreamAlphaTrail() {
    const currentTime = millis();

    if (currentTime-this.lastAlphaUpdate >= this.alphaSpeedMS) {
      this.lastAlphaUpdate = currentTime;

      if (this.alphaPeakIndex < streamLength+this.alphaTrailLength) {
        this.alphaPeakIndex++;
      } else {
        if (!this.isResetting) {
          this.isResetting = true;
          this.resetStartTime = currentTime;
        }

        if (currentTime - this.resetStartTime >= this.resetDelay) {
          this.alphaPeakIndex     = 0;
          this.resetDelay         = int(random(1000, 5000));
          this.alphaTrailLength   = int(random(alphaTrailLengthStart, alphaTrailLengthEnd));
          this.alphaSpeedMS       = this.getAlphaSpeedMS();
          this.lastAlphaUpdate    = currentTime;
          this.isResetting        = false;
        }
      }
    }
  }

  // Updates and renders all symbols in the stream, including alpha trail movement.
  run() {
    for (let i = 0; i < streamLength; i++) {
      const symbol = this.stream[i];
      symbol.updateCharacter();
      this.updateStreamRGBA(symbol, i);
      symbol.render();
    }
    
    // Maintains alpha trail for all symbols in stream.
    // Call once per stream and not in loop above.
    this.updateStreamAlphaTrail();
  }
}

// Returns a random Katakana character.
function getRandomKatakanaChar() {
  return String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
}

// Initialises the matrixStream array by creating Stream instances.
function createMatrixStreams() {
  for (let i = 0; i < maxStreams; i++) {
    matrixStream.push(new Stream(i));
  }
}

// Calls the run method of each Stream object to update and render the rain effect.
function maintainMatrixStreams() {
  for (let i = 0; i < maxStreams; i++) {
    matrixStream[i].run();
  }
}

// Initialises the canvas and matrix streams.
function setup() {
  let canvas = createCanvas(canvasX, canvasY);
  canvas.parent('digital-rain-container'); // This attaches it to a specific div
  
  createMatrixStreams();
  noStroke();
  frameRate(20);
}

// Continuously renders the digital rain effect.
function draw() {
  background(0, 150);
  maintainMatrixStreams();
}
