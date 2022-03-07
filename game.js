let screen = vec(800, 600);
canvas.width = screen.x;
canvas.height = screen.y;

let assets = {};

let images = [
	"data/slime1.png"
];
let sounds = [];


let canvas_size = {
	x: 0, y: 0, width: screen.x, height: screen.y
};

let mouse = vec(0, 0);

document.addEventListener("DOMContentLoaded", function()
{
	canvas.style.width = "unset";
	canvas.style.height = "unset";
	canvas.style.top = "unset";
	canvas.style.left = "unset";

	let toggleDebug = newInputType("toggleDebug", ["`"]);

	let brain = new Thing();
		brain.listen("tick", function()
		{
			let image = {
				x: 0, y: 0, width: screen.x, height: screen.y
			};

			let originalWidth = image.width;
			let originalHeight = image.height;

			let options = {
				container: new AS.Size(window.innerWidth, window.innerHeight),
				target: new AS.Size(originalWidth, originalHeight),
				policy: AS.POLICY.ShowAll
			};

			let rect = AS.getScaledRect(options);

			image.x = rect.x;
			image.y = rect.y;
			image.width = rect.width;
			image.height = rect.height;

			canvas.style.width = image.width + "px";
			canvas.style.height = image.height + "px";
			canvas.style.top = image.top + "px";
			canvas.style.left = image.left + "px";

			if(toggleDebug.pressed && input.debounce === 0)
			{
				debug = !debug;
				input.debounce = 20;
			}
		});

	brain.listen("mousemove", function(mx, my, event)
	{
		mouse = local_mouse(event.clientX, event.clientY);

	});

	function local_mouse(mx, my)
	{
		let px = ((mx) - canvas_size.x) * canvas_size.scale;
		let py = ((my) - canvas_size.y) * canvas_size.scale;

		return vec(px, py)
	}

	load_assets(images, sounds, function(progress, file, asset, type)
	{
		assets[file] = asset;
		console.log(type, file);
		if(progress >= 1.0)
		{
			slime();
			tick(true);
		}
	});
});