---
layout: post
title:  "Conway's Game of Life"
subtitle: "Implementing Conway's Game of Life in Godot v3.6"
date:   2025-08-02 06:00:00 +0000
categories: jekyll update
---

<style>
  .game-container {
    display: flex;
    justify-content: center;
    margin: 0; /*2rem 0;*/
  }

  .game-container iframe {
    border: none;
    border-radius: 0px;
    overflow: hidden;
  }
  
  .centered-note {
    text-align: center;
    margin-top: 0.3rem;
	margin-bottom: 1.5rem;
	font-size: 0.90rem;
  }
</style>

<div class="game-container">
  <iframe src="/assets/conways-game-of-life/index.html" width="360" height="495"></iframe>
</div>

<p class="centered-note"><em>(Click on cells to change their alive state)</em></p>


Implementing *[Conway's Game of Life][game-of-life-wkp]*, written in C# using the Godot Game Engine v3.6.

<br>

Three classes were created to implement *Conway's Game of Life* in Godot: `Cell`, `Grid`, and `GridUI`. The `Cell` class contains the properties for each individual cell: x, y, width, height, RGB, alive state, etc. Each cell is a `ColorRect` object type.

The `Grid` class creates the background and lines that make up the grid.


The `GridUI` class connects all of the UI elements in Godot and allows the game state to be manipulated. These elements include: a slider for the time between generations, a pause/play button, a reset button, and a spinbox to enter the starting alive percentage for cell creation.

Each cell is created once, and only its alpha value changes to represent its dead or alive state. This avoids the overhead of creating and deleting cells every frame. 

The four rules of *Conway's Game of Life* are:

1. *Any live cell with fewer than two live neighbours dies, as if by underpopulation.*
2. *Any live cell with two or three live neighbours lives on to the next generation.*
3. *Any live cell with more than three live neighbours dies, as if by overpopulation.*
4. *Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.*

This logic is implemented in the `maintainGrid()` function. Two iterations are carried out inside this function:

- During the first iteration, each cell stores its next alive state based on its neighbours.  
- During the second iteration, each cell’s alive state is updated.  

The cells alive state is not changed during the first iteration to prevent it from affecting the behaviour of its neighbouring cells.

<div class="wide-code">
{% highlight javascript %}
private void maintainGrid()
{
	// Set each cells next state on the first grid iteration. Do not update cell
	// alive states while iterating as this will change neighbouring cells behaviour.
	for (int x = 0; x < gridX; x++)
	{
		for (int y = 0; y < gridY; y++)
		{
			int aliveNeighbourCells = getAliveNeighbourCells(x,y);
			if (cells[x,y].getCellAliveState())
			{
				// 2. Any live cell with two or three live neighbours lives on to the next generation.
				if (aliveNeighbourCells >= 2 && aliveNeighbourCells <= 3)
				{
					continue;
				}
				// 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
				// 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
				if (aliveNeighbourCells < 2 || aliveNeighbourCells > 3)
				{
					cells[x,y].setCellNextAliveState(false);
				}
			}
			else
			{
				// 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				if (aliveNeighbourCells == 3)
				{
					cells[x,y].setCellNextAliveState(true);
				}
			}
		}
	}
	
	// Update the entire grids alive state
	aliveCells = 0;
	for (int x = 0; x < gridX; x++)
	{
		for (int y = 0; y < gridY; y++)
		{
			bool alive = cells[x,y].getCellNextAliveState();
			cells[x,y].setCellAliveState(alive);
			if (alive)
			{
				aliveCells++;
			}
		}
	}
	generation++;
}
{% endhighlight %}
</div>

The full code is available on [GitHub][game-of-life-gh].

[game-of-life-gh]: https://github.com/scottranken/conways-game-of-life
[game-of-life-wkp]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
