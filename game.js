let screen = vec(800, 600);

let assets = {};

let images = [
	"data/slime1.png"
];
let sounds = [];

document.addEventListener("DOMContentLoaded", function()
{
	let brain = new Thing();
		brain.listen("tick", function()
		{
		});

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