let screen = vec(800, 600);

let assets = {};

let images = [
	"data/slime1.png"
];
let sounds = [
	"data/plink.ogg"
];

let can_play_audio = false;

document.addEventListener("DOMContentLoaded", function()
{
	canvas.width = screen.x;
	canvas.height = screen.y;

	load_assets(images, sounds, function(progress, file, asset, type)
	{
		assets[file] = asset;
		console.log(type, file);
		if(progress >= 1.0)
		{
			slime();
			scale_canvas(screen);
			tick(true);
		}
	});

	document.addEventListener("mousedown", function()
	{
		can_play_audio = true;
	});
});