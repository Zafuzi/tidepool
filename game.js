let screen = vec(800, 600);

let titleFont = load_font("Arial", 30, "#F09D28");

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

	scale_canvas(screen);

	// title/loading screen
	title = new Thing();
	load_progress = 0;
	load_file = "";

	title.listen( "draw_4", ( mouse_x, mouse_y ) => {
		if( load_progress < 1.0 ) {
			draw_text( "Tidepool", screen.x * 0.5, screen.y * 0.5 - 15, titleFont, "center", 0.4 );
			draw_text( "Loading: "+round(load_progress * 100)+"% "+load_file, screen.x * 0.5 + 15, screen.y * 0.4, titleFont, "center", 0.5 );
		} else  {
			draw_text( "Tidepool", screen.x * 0.5, screen.y * 0.5 - 15, titleFont, "center", 1 );
			draw_text( "Click to Start ", screen.x * 0.5, screen.y * 0.5 + 15, titleFont, "center", 1 );

			load_file = "";
		}
	} );

	load_assets( images, sounds, ( prog, file, asst, type ) => {

		load_progress = prog;
		load_file = file;
		assets[ file ] = asst;

		log( load_progress+"% "+type+" "+file );
		if( load_progress >= 1.0 ) {
			title.listen( "mousedown", () => {
				title.destroy();	// destroy the title page
				//debug = true;
				slime();
			} )
		}

	}, console.error );

	tick( true ); // turn on ticking; tick handlers will be called
});

// helpers
function degrees2radians(degrees)
{
	return degrees * (Math.PI/180);
}

function radians2degrees(radians)
{
	return radians * (180/Math.PI);
}