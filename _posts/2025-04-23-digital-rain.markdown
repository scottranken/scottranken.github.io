---
layout: post
title:  "Digital Rain"
subtitle: "Creating the Matrix Digital Rain Effect in p5.js"
date:   2025-04-23 06:00:00 +0000
categories: jekyll update
---

<div id="digital-rain-container"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<script src="/assets/digital-rain.js"></script>

<!-- Round the canvas corners -->
<style>
  #digital-rain-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem auto;
    height: 400px;
    max-width: 100%;
    padding: 0 1rem;
  }

  #digital-rain-container canvas {
    border-radius: 12px;
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 600px) {
    #digital-rain-container {
      height: 300px; 
    }
  }
</style>

An interpretation of the digital rain effect as seen in The Matrix films, written in JavaScript using the p5.js library.

<br>

Two classes were created to achieve this effect: `Symbols` and `Stream`. The `Symbols` class contains the properties for each individual symbol: x, y, character, RGB, alpha, etc.

The `Stream` class contains a series of `Symbols` positioned down the canvas's Y axis. Streams are created along the canvas's X axis, populating the entire 400x400 canvas.

The rain effect is achieved by manipulating each symbol’s alpha value within a stream. None of the symbols move within the canvas; it is purely the alpha values that create the effect. Each symbol’s alpha value is set to 0 on creation.
A ‘peak’ alpha index is maintained, representing the leading symbol in a stream with an alpha value of 255.

A timer is used to determine when to increment the peak alpha index to the next symbol in the stream. Streams are reset once their entire rain trail is below the canvas's Y axis. The trail’s length, respawn delay, and peak alpha increment time (rain speed) are randomised on reset so that the stream is not identical each cycle.

{% highlight javascript %}
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
{% endhighlight %}

Symbol alpha values are set using the p5.js `map()` function. This function maps the alpha from 255 to 0 based on the symbol’s position in the stream, in relation to the peak alpha index and the length of the rain trail.

{% highlight javascript %}
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
{% endhighlight %}

The symbols are set to Katakana characters and have a 50% chance of changing. There is also a 33% chance that a stream will begin with a white symbol on creation. Lastly, a glow effect is applied to each symbol by manipulating the p5.js `drawingContext` variable.

The full code is available on [GitHub][digital-rain-gh].

[digital-rain-gh]: https://github.com/scottranken/digital-rain
