---
layout: post
title:  "Starfield"
subtitle: "Creating a Starfield Effect in pixi.js" 
date:   2025-09-06 06:00:00 +0000
categories: jekyll update
---

<div id="star-field-container" style="position: relative; text-align: center; margin: 2rem 0; height: 360;"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/8.12.0/pixi.min.js"></script>
<script src="/assets/star-field.js"></script>

<!-- Round the canvas corners -->
<style>
  #star-field-container canvas {
	border-radius: 12px;
  }
</style>

Creating a starfield effect, written in JavaScript using the pixi.js library.

<br>

A single class was created to achieve this effect: `Star`. This class creates a star and updates its position. The `starfield` array contains hundreds of stars to produce the full starfield effect.

Each star is drawn as a line. The line’s length, or trail, represents the warp speed and is determined by the slider’s `warpSpeed` value. When `warpSpeed` is set to 1, stars are drawn as circles so they appear as single points without trails and to eliminate unwanted small trails at low warp speeds.

Each star’s position is calculated per frame, both before and after moving. The difference between these positions is multiplied by the `warpSpeed` value to determine the trail length.

A star's movement is calculated based on time in milliseconds, not frames. Stars are reset to a far distance once they pass the viewer.

{% highlight javascript %}
update(deltaMS, starGraphics) {
  // Where the star is projected before moving closer
  const prevStarX = projectToScreen(this.x, this.z, canvasWidth);
  const prevStarY = projectToScreen(this.y, this.z, canvasHeight);
  
  // Move the star closer to the screen each frame. Based on time (ms) and not frames.
  this.z -= warpSpeed * (deltaMS / targetFrameMS);
  
  // Reset the stars position to far away when it surpasses the viewer.
  if (this.z < 1) {
    this.reset();
    return; // Don't draw trail on reset
  }
	  
  // Where the star is projected after moving closer
  const starX = projectToScreen(this.x, this.z, canvasWidth);
  const starY = projectToScreen(this.y, this.z, canvasHeight);
	  
  // Calculate the difference between the prev position and current position.
  // Multiply that by the warpSpeed to create the stars trail.
  let trailX = prevStarX + (starX - prevStarX) * warpSpeed;
  let trailY = prevStarY + (starY - prevStarY) * warpSpeed;
	  
  // Stars are drawn as lines whose length depends on warpSpeed. When warpSpeed is 
  // equal to one, stars are drawn as circles instead to avoid small unwanted trails. 
  if (warpSpeed == 1){
    starGraphics.circle(prevStarX, prevStarY, 0.5);
  }else{
    starGraphics.moveTo(prevStarX, prevStarY).lineTo(trailX, trailY);
  }
  
  this.prevZ = this.z;
}
{% endhighlight %}

The full code is available on [GitHub][starfield-gh].

[starfield-gh]: https://github.com/scottranken/starfield

<br>
