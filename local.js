// init
var image_files = [
	{ name:"player", path: "data/images/player.png"},
	{ name:"monster", path: "data/images/monster.png"},
];

var sound_files = [];

Squids.init(
{
	fps: 144,
	antialias: true,
	resolution: 1
});

function prog(loader, resource)
{
	console.log( `${loader.progress}% - ${resource.name}` );
}

Squids.load_assets( image_files, sound_files, prog, function(loader, resources)
{
	console.log( resources );

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	const canvas = Squids.canvas;
	const SW =  canvas.width;
	const SH = canvas.height;

	var tick = 0;

	let player = Squids.create( Squids.resources["player"].texture );
		player.scale.x = player.scale.y = 0.5;
		player.anchor.x = player.anchor.y = 0.5;
		player.x = SW * 0.5;
		player.y = SH * 0.5;
		player.show().live( function(delta)
		{
			let self = player;

			if( input("w") || input("k") || input("arrowup") )
			{
				self.y--;
			}

			if( input("a") || input("h") || input("arrowleft") )
			{
				self.x--;
			}

			if( input("s") || input("j") || input("arrowdown") )
			{
				self.y++;
			}

			if( input("d") || input("l") || input("arrowright") )
			{
				self.x++;
			}
		});

	let monster = Squids.create( Squids.resources["monster"].texture );
		monster.scale.x = monster.scale.y = 0.25;
		monster.anchor.x = monster.anchor.y = 0.5;
		monster.show().live( function(delta)
		{
			let self = monster;
			self.x = SW * 0.5 + 100;
			self.y = SH * 0.5 + 100;
		});

	let text = Squids.create_text( "", {fontFamily : 'Courier', fontSize: 20, fill : 0xff1010, align : 'center'} );
		text.y = SW * 0.01;
		text.y = SH * 0.01;
		text.show().live( delay => {
			text.text = "Tick: " + tick;
		});

	// make a global loop
	// Called after the brains of all the squids are called
	const loop = delta => {
		tick += 1;
	};

	Squids.tick = loop;
});

var keys = [];
var key_str = "";

function onKeyDown(event)
{
	let key = event.key.toLowerCase(); // ignore shifted keys for now
	if( keys.indexOf( key ) == -1 )
	{
		keys.push( key );
	}
	key_str = keys.join(", ");
}

function onKeyUp(event)
{
	let key = event.key.toLowerCase(); // ignore shifted keys for now
	let index = keys.indexOf( key );
	if( index != -1 )
	{
		keys.splice( index, 1 );
	}
	key_str = keys.join(" ");
}

function input(key)
{
	return key_str.includes(key);
}
