let screen = vec(800, 600);
canvas.width = screen.x;
canvas.height = screen.y;

document.addEventListener("DOMContentLoaded", function()
{

	let toggleDebug = newInputType("toggleDebug", ["`"]);

	let brain = new Thing();
		brain.listen("tick", function()
		{
			// determine which is smaller
			if(window.innerWidth > window.innerHeight)
			{
				canvas.style.height = window.innerHeight + "px";
				canvas.style.width = 4 * window.innerHeight / 3 + "px";
			}
			else
			{
				canvas.style.width = window.innerWidth + "px";
				canvas.style.height = 3 * window.innerWidth / 4 + "px";
			}

			if(toggleDebug.pressed && input.debounce === 0)
			{
				debug = !debug;
				input.debounce = 20;
			}
		});

	slime();
	tick(true);
});