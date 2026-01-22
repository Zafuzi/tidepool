/*
Squids - An HTML5 canvas-based game engine and a state of mind.
Copyright 2025  Sleepless Software Inc.  All Rights Reserved
*/

function Squids( _canvas = null, container = null) {

    const _Squids = this;

    Object.defineProperty( _Squids, "version", { value: "6.6.0", writable: false, } );
    Object.defineProperty( _Squids, "code_name", { value: "Harpoon", writable: false, } );


    // What could possibly go wrong here?
    _Squids.globalize = function() {
        for( let k in _Squids ) {
            globalThis[ k ] = _Squids[ k ];
        }
    }

    // Some vars for internal use
    const { sqrt, sin, cos, round, floor, abs, atan2, PI, min, max } = Math;
    const PI2 = PI * 2;	// 1 full rotation (360 degrees)
    const PIH = PI / 2;	// one half of PI
    const doc_body = document.body;


    /**
     * Squids.debug();            // returns debug status (true = on)
     * Squids.debug( true );      // turn debug on/off
     * Squids.debug( 1, "Hello, world!" );  // set debug message number '1' to "Hello, world!"
     */
    let dbg_flag = false;
    const dbg_msgs = [];
    _Squids.debug = function( ...args ) {
        if( args.length >= 2 ) {
            dbg_msgs[ args[ 0 ] | 0 ] = args[ 1 ];
        }
        else
        if( args.length == 1 ) {
            dbg_flag = !! args[ 0 ];
        }
        return dbg_flag;
    };


    // Return an every increasing integer which can be used as a unique id.
    let _seq_num = 0;
    _Squids.seq = function() {
        _seq_num += 1;
        return _seq_num;
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Vector object
    // Used to define x,y positions and w,h sizes.
    // The Vec() function always creates a new object.
    // The methods of a Vec object modify the object in place, or modify nothing.
    // Usage that creates a new Vec object:
    // 		Vec()			=  { x:0, y:0, z:0 } 
    // 		Vec( 7 )		=  { x:7, y:7, z:7 } 
    // 		Vec( 1, 2 )		=  { x:1, y:2, z:0 }
    // 		Vec( 1, 2, 3 )	=  { x:1, y:2, z:3 }
    // 		Vec( v )		=  { x:v.x, y:v.y, z:v.z } // clone
    const Vec = _Squids.Vec = function( x = 0, y = 0, z = 0 ) {

        if( typeof x === "number" ) {
            if( arguments.length == 1 ) {
                y = x; z = x;
            }
        } else {
            y = x.y; z = x.z; x = x.x;
        }

        // the new Vec
        let v = {
            x, y, z,
        };

        // v.add( 1 )
        // v.add( 1, 2 )
        // v.add( 1, 2, 3 )
        // v.add( v )
        v.add = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x += x; v.y += y; v.z += z;
            return v;
        }

        // v.sub( 1 )
        // v.sub( 1, 2 )
        // v.sub( 1, 2, 3 )
        // v.sub( v )
        v.sub = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x -= x; v.y -= y; v.z -= z;
            return v;
        }

        // v.mlt( 2 )
        // v.mlt( 2, 3 )
        // v.mlt( 2, 3, 4 )
        // v.mlt( v )
        v.mlt = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x *= x, v.y *= y, v.z *= z;
            return v;
        }

        // v.div( 2 )
        // v.div( 2, 3 )
        // v.div( 2, 3, 4 )
        // v.div( v )
        v.div = function(x = 0, y = 0, z = 0) {
            if( typeof x === "number" ) {
                if( arguments.length == 1 ) {
                    z = y = x;
                }
            } else {
                z = x.z; y = x.y; x = x.x;
            }
            v.x /= x; v.y /= y; v.z /= z;
            return v;
        }

        // v.qmag()
        // can be used to calculate the square of the magnitude of a vector for use in comparison
        // with another qmag() value, without having to calculate the square root.
        // like v.mag(), but doesn't give you and absolute magnitude, just a relative one.
        v.qmag = function() {
            return ( v.x * v.x ) + ( v.y * v.y );   // XXX z?
        }

        // v.mag()
        // returns the magnitude of the vector, which is the square root of the sum of the squares of the x,y,z components.
        v.mag = function() {
            return sqrt( v.qmag() );
        };

        return v;
    };

    // takes a source position and a target position and 
    // returns a number from 0.0 thru PI * 2 that represents the angle
    // between the two, or the "heading" from source to target
    // TODO Make this align with common vector terms
    // TODO integrate with Vec
    // TODO handle 3 dimensions
    const vector_to_rotation = _Squids.vector_to_rotation = function( s_pos, t_pos ) {
        let r = atan2( t_pos.y - s_pos.y, t_pos.x - s_pos.x ) + PIH;
        r = r / PI2;
        return r;
    }

    // converts a heading/angle to cartesion coords for a distance of 1.0
    // passing in a vec as 'v' makes it write into that vec rather than
    // creating a new one.
    // TODO Make this align with common vector terms
    // TODO integrate with Vec
    // TODO handle 3 dimensions
    const rotation_to_vector = _Squids.rotation_to_vector = function( r, v ) {
        r = ( r * PI2 ) - PI;
        if( ! v ) 
            return Vec( sin( r ), -cos( r ) );
        v.x = sin( r );
        v.y = -cos( r );
        return v;
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Return a font-ish object that you can pass into draw_text().
    // This simply uses any font that the browser can provide.
    // TODO support bold/italic/underline?
    const load_font = _Squids.load_font = function( face, size, color ) {
        let font = { height: size, face: face, style: "" + size + "px " + face, color: color };
        return font;
    };

    // debug font
    const DBG_FONT_SIZE = 16;
    const DBG_LINE_HEIGHT = DBG_FONT_SIZE + ( DBG_FONT_SIZE * 0.2 );
    const DBG_SHADOW_OFFSET = DBG_FONT_SIZE * 0.1;
    const dbg_font = load_font( "courier", DBG_FONT_SIZE, "#ff0" );
    const dbg_font_shadow = load_font( "courier", DBG_FONT_SIZE, "#000" );

    // default font
    const default_font = _Squids.default_font = load_font( "helvetica", 15, "#fff" );


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    function Img( data, w, h, path ) {

        let _img = this;

        Object.defineProperty( _img, "id", { value: _Squids.seq(), writable: false, } );

        _img.path = path;
        _img.w = w;
        _img.h = h;
        _img.data = data;
        _img.smoothing = false;

        _img.size = function() {
            return Vec( _img.w, _img.h );
        };

        // returns an approximate radius of the image, which is half the average of the width and height
        // Use to make a simple, rough collision circle for the image
        _img.make_radius = function() {
            let size = _img.size();	// get image w, h
            return ( ( size.x + size.y ) / 2 ) * 0.5;	// half of average of w and h
        };

    }

    // load and return an image object given its path.
    const load_image = _Squids.load_image = function( path, okay = ()=>{}, fail = ()=>{} ) {
        // XXX can this just use new Image() or something instead of adding something to the DOM?
        let e = document.createElement( "img" );
        e.src = path;
        e.style.display = "none";
        e.onload = function() {
            let img = new Img( e, e.width, e.height, path );
            e.remove();	// remove from DOM - not needed there anymore
            okay( img );
        };
        e.onerror = fail;
        doc_body.appendChild(e);	// add to DOM so it will load
    };

    // create and return a new image that is flipped horizontally from the original
    // also set as a method of the image object
    _Squids.flip_x = function( img ) {
        img = img || this;
        let cnv = new OffscreenCanvas( img.w, img.h );
        let ctx = cnv.getContext( "2d" );
        ctx.scale( -1, 1 );
        ctx.drawImage( img.data, -img.w, 0 );
        let new_img = new Img( cnv, img.w, img.h, img.path );
        return new_img;
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    const audioContext = new AudioContext();

    const playing_sounds = {};

    function Snd( audio, path ) {

        let _snd = this;

        Object.defineProperty( _snd, "id", { value: _Squids.seq(), writable: false, } );
        _snd.path = path;
        _snd.audio = audio;
        _snd.on_handlers = {};
        _snd.loop_flag = false;

        _snd.play = async function( loop = false ) {

            if( playing_sounds[ _snd.id ] ) {
                // sound already playing, so just seek to the beginning
                // _snd.fastSeek( 0 );
                return;
            }

            _snd.loop_flag = !! loop;

            if( audioContext.state === "suspended" ) {
                audioContext.resume();
            }

            audio.onended = function() {
                if( _snd.on_handlers.end ) {
                    if( !! _snd.on_handlers.end( _snd, _snd.loop_flag ) ) {
                        // on_end returned true, so restart the sound (not that this works even if looping is false)
                        _snd.play();
                        return;
                    }
                } else {
                    if( _snd.loop_flag ) {
                        _snd.play( _snd.loop_flag );
                        return;
                    }
                }
                delete playing_sounds[ _snd.id ];
            }

            try {
                await _snd.audio.play();
                playing_sounds[ _snd.id ] = _snd;
            } catch( e ) {
                if( _snd.on_handlers.error ) {
                    _snd.on_handlers.error( e );
                } else {
                    console.error( e );
                }
            }
        };

        _snd.pause = function() {
            _snd.audio.pause()
        };

        _snd.volume = function( v ) {
            _snd.gainNode.gain.value = v;
        };

        _snd.on = function( evt, cb ) {
            _snd.on_handlers[ evt ] = cb;
        };

        _snd.loop = function( l ) {
            if( l !== undefined ) {
                _snd.loop_flag = !! l;   // set new value
            }
            return _snd.loop_flag;       // return current value
        };

        _snd.clone = function( okay, fail ) {
            return load_sound( path, okay, fail );
        };

        _snd.track = audioContext.createMediaElementSource( audio );
        _snd.gainNode = audioContext.createGain();
        _snd.track.connect( _snd.gainNode).connect( audioContext.destination );

    }

    // load and return a sound object given its path.
    const load_sound = _Squids.load_sound = function( path, okay = ()=>{} , fail = ()=>{} ) {

        let audio = null;

        audio = new Audio();
        audio.src = path;

        audio.onloadeddata = function() {
            let snd = new Snd( audio, path );
            okay( snd );
        };

        audio.onerror = function( err ) {
            fail( err );
        };

        audio.load();

    };

    // Stops all sounds from playing
    const stop_audio = _Squids.stop_audio = function() {
        for( let k in playing_sounds ) {
            let snd = playing_sounds[ k ];
            snd.loop( false );
            snd.pause();
            delete playing_sounds[ k ];
        }
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Load many images and sounds with progress call-back.
    // Intended as a way for displaying progress bar while loading stuff.
    // The images and sounds arguments are arrays of path strings.
    // The progress callback function is called after each image or
    // sound file is loaded with:
    // 		- a number, 0.0 thru 1.0, telling you how far along it is percentage-wise
    // 		- the path of the file just loaded
    // 		- the actual object loaded (image or sound)
    // 		- the type of object it is as a string, either "image" or "sound"
    // The fail callback function receives an explanatory error string
    // TODO: Make this take one array of all assets rather separate ones for imgs & snds
    _Squids.load_assets = function( base, img_paths, snd_paths, progress = ()=>{} , fail = ()=>{} ) {

        let total = img_paths.length + snd_paths.length;

        let num_loaded = 0;
        let num_failed = 0;

        let fin = function( path, asset, type ) {
            num_loaded += 1;
            let num_processed = num_loaded + num_failed;
            progress( num_processed / total, path, asset, type );
        };

        // Note: these loops effectively fire off all the loads at once
        // The browser 'hopefully' throttles and queues them in some way
        for( let path of img_paths ) {
            load_image( base + "/" + path, img => {
                fin( path, img, "image" );
            }, err => {
                num_failed += 1;
                fail( err, path, "image" );
            } );
        }
        for( let path of snd_paths ) {
            load_sound( base + "/" + path, snd => {
                fin( path, snd, "sound" );
            }, err => {
                num_failed += 1;
                fail( err, path, "sound" );
            } );
        }

    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Canvas related stuff
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    let canvas = null;
    let created_canvas = null;
    let ctx = null;

    const _screen = { width: window.innerWidth, height: window.innerHeight };

    // return the current canvas
    _Squids.get_canvas = function() {
        return canvas;
    }

    // Tell Squids to start using the provided canvas, or create a new one if cnv is null
    const set_canvas = _Squids.set_canvas = function( cnv = null ) {
        if( cnv ) {
            canvas = cnv;
        } else {
            if( created_canvas ) {
                // destroy previously created canvas
                created_canvas.remove();
            }
            // create new canvas the full (current) size of the view port
            canvas = document.createElement("canvas");
            created_canvas = canvas;
            canvas.id = "SquidsCanvas";
            //canvas.style.position = "absolute";
            //canvas.style.left = "0";
            //canvas.style.top = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.backgroundColor = "black";
            if( ! container ) {
                container = doc_body;
            }
            container.appendChild(canvas);
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
        ctx = canvas.getContext( "2d" );
        _screen.width = canvas.clientWidth;
        _screen.height = canvas.clientHeight;
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Draw a text str at a given pos, in a given font,
    // with a given alignment and opacity
    // TODO add rotation, scale
    const draw_text = _Squids.draw_text = function( str, x, y, font, align, opa, /* rot, scl */ ) {
        ctx.save();
        ctx.font = font.style;
        ctx.fillStyle = font.color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = align || 'center';
        ctx.globalAlpha = opa;
        ctx.fillText( str, x, y );
        let w = ctx.measureText( str ).width;
        ctx.restore();
        return w;
    };

    // Return the width in pixels of a string WERE IT TO BE drawn in the given font
    _Squids.text_width = function( str, font ) {
        ctx.save();
        ctx.font = font.style;
        ctx.textBaseline = 'middle';
        let w = ctx.measureText( str ).width;
        ctx.restore();
        return w;
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Draw a line from one point to another, with a given color and opacity
    _Squids.draw_line = function( x1 = 0, y1 = 0, x2 = 10, y2 = 10, color = "#777", opa ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo( x1, y1 );
        ctx.lineTo( x2, y2 );
        ctx.stroke();
        ctx.restore();
    }

    // Draw an unfilled rectangle
    _Squids.draw_rect_unfilled = function( dx = 0, dy = 0, dw = 10, dh = 10, color = "#777", opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;

        let ox = dx + (dw * 0.5);
        let oy = dy + (dh * 0.5);
        ctx.translate( ox, oy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -ox, -oy );

        ctx.strokeStyle = color;
        ctx.strokeRect(dx, dy, dw, dh);
        ctx.restore();
    }

    // Draw a filled rectangle
    // to alter opacity, change color to something like "rgba(r,g,b,opa)" or similar
    const draw_rect_filled = _Squids.draw_rect_filled = function( x, y, w, h, color, opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;

        let ox = x + (w * 0.5);
        let oy = y + (h * 0.5);
        ctx.translate( ox, oy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -ox, -oy );

        ctx.fillStyle = color;
        ctx.fillRect( x, y, w, h);
        ctx.restore();
    };


    // Draw an unfilled circle with a given radius and color
    const draw_circle_unfilled = _Squids.draw_circle_unfilled = function( dx = 0, dy = 0, r = 10, color = "#777", opa = 1 ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.ellipse( dx, dy, r, r, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    // Draw a crosshair (two perpendicular lines) at dx, dy
    const draw_cross = _Squids.draw_cross = function( dx = 0 , dy = 0 , size = 25 , color = "#777", opa = 1, rot = 0 ) {
        ctx.save();
        ctx.globalAlpha = opa;
        ctx.translate( dx, dy );
        ctx.rotate( rot * PI2 );
        ctx.translate( -dx, -dy );
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo( dx - size, dy );
        ctx.lineTo( dx + size, dy );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo( dx, dy - size );
        ctx.lineTo( dx, dy + size );
        ctx.stroke();
        ctx.restore();
    }

    //	-	-	-	-	-	-	-	-	-	-	-	-	-


    // Draw image onto canvas at dx,dy, with opacity, rotation, and scaling
    // Arguments:
    // 	img = the source image
    // 	dx,dy = destination x,y
    // 	opa = opacity (gangnam style)
    // 	rot = rotation angle
    // 	px,py = x,y of pivot point for rotation image top-left corner
    // 	sclx,scly = scaling factor 1.0 = normal size
    // 	sx,sy = x,y offset into src img of top left corner of sub-rectangle
    // 	sw,sh = sw,sh width and height of src subrectangle
    const draw_image = _Squids.draw_image = function( img, dx = 0, dy = 0, opa = 1, rot = 0, px = img.w * 0.5, py = img.h * 0.5, sclx = 1, scly = 1, sx = 0, sy = 0, sw = img.w, sh = img.h ) {

        ctx.save();
        ctx.imageSmoothingEnabled = img.smoothing;
        ctx.globalAlpha = opa;

        dx = round( dx );
        dy = round( dy );
        let dw = round( sw * sclx );
        let dh = round( sh * scly );

        if(rot == 0) {
            ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh );
        } else {
            ctx.translate(dx + px, dy + py);
            ctx.rotate( rot * PI2 );
            ctx.translate(-(dx + px), -(dy + py));
            ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
        }

        if( dbg_flag ) {
            draw_rect_filled( dx, dy, dw, dh, "#0ff", 0.1);
        }

        ctx.restore();
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Events
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // This holds references to the event listeners.
    // Each attribute in this object is one of the event types
    // and its corresponding value is another object with
    // an attribute for each Squid id that is listening for that event.
    const listeners = _Squids.listeners = {
        // tick: {
        //      "123": { t: squid, f: func },
        //      ...
        // }
        // ...
    };

    let set_listener = function( squid, type, func = () => {} ) {
        let l = listeners[ type ];
        if( ! l ) {
            l = listeners[ type ] = {};
        }
        l[ squid.id ] = { t: squid, f: func };
        if( type === "draw" ) {
            // special case; update priority-sorted list for drawing
            sort_for_draw();
        }
    }

    let clear_listener = function( squid, type ) {
        if( listeners[ type ] ) {
            delete listeners[ type ][ squid.id ];
            if( type === "draw" ) {
                // special case; update priority-sorted list for drawing
                sort_for_draw();
            }
        }
    }

    let clear_all_listners = function( squid ) {
        for( let type in listeners ) {
            clear_listener( squid, type );
        }
    }

    // special ordered array of "draw" listeners sorted by priority
    let sorted_draw_listeners = [];

    // Sort draw listeners by priority and store in sorted_draw_listeners
    function sort_for_draw() {
        sorted_draw_listeners = Object.values( listeners[ "draw" ] ) || [];
        sorted_draw_listeners.sort( ( a, b ) => a.t.priority - b.t.priority );
    }

    // Dispatch an event of type 'type' to everything listening for it
    const emit = _Squids.emit = function( ...args ) {
        let type = args.shift();
        let l = listeners[ type ];	// get hash of listeners
        if( ! l ) {
            return; // no listeners
        }
        let objs = Object.values( l );
        if( type === "draw" ) {	// if in the special case of the draw event ...
            objs = sorted_draw_listeners;	// use this sorted array instead (see listen())
        }
        for( let o of objs ) {	// walk through listeners ...
            let sq = o.t;		// get Squid reference
            if( sq.active ) {
                let fn = o.f;		// get listener func
                fn.apply( sq, args );	// call listener func with remaining args
            }
        }
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // TODO: Deal with touch events?

    // Holds last seen x,y locations taken from pointer events
    const pointer = _Squids.pointer = { x: 0, y: 0 };

    // Holds the event handlers for the pointer events
    const _ptr_event_handlers = {};

    // Convert a pointer event to a Squids pointer event
    function cvt_ptr_event( evt ) {
        return {
            id: evt.pointerId,
            x: evt.clientX - canvas.offsetLeft,
            y: evt.clientY - canvas.offsetTop,
            type: evt.type,
            pointer_type: evt.pointerType,
            primary: evt.isPrimary,
        };
    };

    // Set a pointer event handler for a given type
    function set_ptr_event_handler( type ) {
        if( ! _ptr_event_handlers[ type ] ) {
            let fn = function( evt ) {
                evt.preventDefault();
                pointer.x = evt.clientX - canvas.offsetLeft;
                pointer.y = evt.clientY - canvas.offsetTop;
                emit( type, pointer.x, pointer.y, cvt_ptr_event( evt ) );
            }
            _ptr_event_handlers[ type ] = fn;
            doc_body.addEventListener( type, fn );
        }
    }

    // remove all pointer event handlers
    function remove_ptr_event_handlers( type ) {
        for( let key in _ptr_event_handlers ) {
            doc_body.removeEventListener( key, _ptr_event_handlers[ key ] );
            delete _ptr_event_handlers[ key ];
        }
    }

    set_ptr_event_handler( "pointerdown" );
    set_ptr_event_handler( "pointerup" );
    set_ptr_event_handler( "pointermove" );


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // tracks key up/down status for reference/polling; e.g, keys[ 'a' ] or keys[ 'space' ]
    const keys = _Squids.keys = {};

    const _key_event_handlers = {};

    function set_key_event_handler( type, handler ) {
        if( ! _key_event_handlers[ type ] ) {
            _key_event_handlers[ type ] = handler;
            doc_body.addEventListener( type, handler );
        }
    }

    function remove_key_event_handlers( type ) {
        for( let key in _key_event_handlers ) {
            doc_body.removeEventListener( key, _key_event_handlers[ key ] );
            delete _key_event_handlers[ key ];
        }
    }

    set_key_event_handler( "keyup", evt => {
        let k = evt.key;
        if( k === " " ) {
            k = "space";
        }
        keys[ k ] = false;
        emit( "keyup", k, evt );
    } );

    set_key_event_handler( "keydown", evt => {
        let k = evt.key;
        if(k === " ") {
            k = "space";
        }
        keys[ k ] = true;
        if( k === "`" && evt.ctrlKey ) {
            dbg_flag = ! dbg_flag;
        }
        emit("keydown", k, evt);
    } );


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    const _general_event_handlers = {};

    // Set a general event handler for a given type
    function set_general_event_handler( type, handler ) {
        if( ! _general_event_handlers[ type ] ) {
            _general_event_handlers[ type ] = handler;
            if( type == "resize" ) {
                window.addEventListener( type, handler );
            } else {
                doc_body.addEventListener( type, handler );
            }
        }
    }

    function remove_general_event_handlers( type ) {
        for( let key in _general_event_handlers ) {
            doc_body.removeEventListener( key, _general_event_handlers[ key ] );
            delete _general_event_handlers[ key ];
        }
    }

    set_general_event_handler( "blur", evt => {
        emit("blur", evt);
    } );
    set_general_event_handler( "focus", evt => {
        emit("focus", evt);
    } );
 
    let resizing_count = 0;
    set_general_event_handler( "resize", evt => {
        resizing_count = 20;
    } );

    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Global hash of all instantiated Squids
    const all_things = _Squids.all_things = {};

    // Destroy all instantiated Squids 
    const destroy_things = function() {
        for( let k in all_things ) {
            let thing = all_things[ k ];
            thing.destroy();
            delete all_things[ k ]; // XXX is this redundant? See thing.destroy()
        }
    };

    // Destroy all things and stop all music and audio
    _Squids.reset = function( cb ) {
        dbg_msgs.length = 0;
        pointer.x = pointer.y = 0;
        for( let k in keys ) {
            delete keys[ k ];
        }
        destroy_things();
        stop_audio();
        if( cb ) {
            setTimeout( cb, 1 );
        }
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Squid - Ye who art the most squiddy
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    const Squid = _Squids.Squid = function( position = Vec( 0, 0 ), img = null, rot = 0, opa = 1, scl = 1 ) {

        const _squid = this;

        // Create a unique and immutable id number
        Object.defineProperty( _squid, "id", { value: _Squids.seq(), writable: false, } );

        // If false, then the tick, physics, draw, animate, functions will not operate,
        // even though it continues to exist
        _squid.active = true;


        // ------------------------
        // Events
        // ------------------------

        // Listen for an event
        // A squid with a given id can only have one listen() callback at a time for a given event type.
        // Call this again with a different function will just replace the old one.
        _squid.listen = function( evt_type, f ) {
            set_listener( _squid, evt_type, f );
            return _squid;
        }

        // Stop listening for an event
        _squid.ignore = function( evt_type ) {
            clear_listener( _squid, evt_type );
            return _squid;
        };

        // Stop listening for all events
        _squid.ignore_all = function() {
            clear_all_listners( _squid );
            return _squid;
        };

 
        // ------------------------
        // Appearance
        // ------------------------

        _squid.position = position;
        _squid.image = img;
        _squid.rotation = rot;    // 0.0 - 1.0
        _squid.opacity = opa;
        _squid.scale = scl;
        _squid.pivot = Vec( 0, 0 );
        _squid.priority = 0;	
        _squid.font = null;
        _squid.text = null;
        _squid.align = "center";

        // Set visual draw priority - lower numbers are drawn first
        _squid.draw_priority = function( n ) {
            if( n === undefined )
                return _squid.priority;
            n = floor( n );
            _squid.priority = n;		// store new pri
            sort_for_draw();
            return _squid;
        }

        // rotate squid to face another squid
        _squid.turn_to_face = function( other ) {
            _squid.rotation = vector_to_rotation( _squid.position, other.position );
            return _squid;
        };

        // Check if this squid is facing another squid
        // 'slop' is the amount of rotation that is allowed to be off
        // and still be considered facing
        _squid.is_facing = function( other, slop = 0.5 ) {
            let rot = vector_to_rotation( other.position, _squid.position );
            if( rot < 0 )
                rot = ( PI2 + rot );
            let diff = abs( _squid.rotation - rot );
            return diff < slop;
        };

        // Generic, default squid drawing function
        // Draws squid.image (if not null), then draws squid.text (if not null)
        const default_draw = _squid.draw = function() {

            if( ! _squid.active )
                return;

            let { scale, opacity, rotation, text, font, align } = _squid;
            let { x, y } = _squid.position;

            let img = _squid.image;
            if( img ) {
                let dw = img.w * scale;	    // width of scaled img to dest
                let dh = img.h * scale;	    // height of scaled img to dest
                let dx = x - ( dw / 2 );	// offset left 1/2 img width
                let dy = y - ( dh / 2 );	// offset up 1/2 img height
                let pvtx = dw * 0.5;
                let pvty = dh * 0.5;
                draw_image( img, dx, dy, opacity, rotation, pvtx, pvty, scale, scale );
            }

            if( text ) {
                draw_text( text, x, y, font || default_font, align || "center", opacity, rotation, scale );
            }

            // if in debug mode, draw some additional stuff 
            if( dbg_flag ) {
                draw_cross( x, y, 10, "#0ff", 0.8, rotation ); // crosshair at squid pos
                // draw collision body if it exists
                let body = _squid.body;
                if( body !== null && body !== undefined ) {
                    if( typeof body === "number" ) {
                        // circle
                        draw_circle_unfilled( x, y, body * scale, "#0f0", 0.7 );
                    } else {
                        // rect
                        // XXX Note that collision rect doesn't honor squid rotation, but should
                        let dx = x - ( ( body.x * scale ) * 0.5 );
                        let dy = y - ( ( body.y * scale ) * 0.5 );
                        _Squids.draw_rect_unfilled( dx, dy, body.x * scale, body.y * scale, "#f00", 0.7 );
                    }
                }
            }
        };

        _squid.set_text = function( text, font = default_font ) {
            _squid.text = text;
            _squid.font = font;
        }


        // ------------------------
        // Simplistic Physics (motion, and collision detection)
        // TODO: replace this with a better/alternative physics engine (matter.js? Box2D?)
        // ------------------------

        _squid.velocity = Vec( 0 );       // motion through space
        _squid.friction = 0;              // 0.0 = no friction, 1.0 instant stop

        _squid.angular_velocity = 0;      // rotational speed
        _squid.angular_friction = 0;      // 0.0 = no friction, 1.0 instant stop


        // Apply thrust to in the direction that we're facing.
        _squid.thrust = function( amount ) {
            let c = rotation_to_vector( _squid.rotation );
            //_squid.velocity += amount;
            _squid.velocity.add( c.mlt( amount ) );
        };


        // Collision body
        // One of:
        //		- null		none - an incorporeal squid
        //		- number	circular body with this radius
        //		- vec		rectangular body with this width and hieght
        _squid.body = null;


        // Default, simplistic, Newtonian physics (TODO: replace with a better/alternative physics engine)
        let default_physics = _squid.physics = function() {
 
            // apply velocity
            //let v = rotation_to_vector( _squid.rotation );
            //v.mlt( _squid.velocity );
            //_squid.position.add( v );
            _squid.position.add( _squid.velocity );

            // Apply friction
            //_squid.velocity *= 1 - max( 0, min( _squid.friction, 1 ) );
            _squid.velocity.mlt( 1 - max( 0, min( _squid.friction, 1 ) ) );
            if( _squid.velocity.mag() < 0.00001 ) {
                _squid.velocity = Vec( 0 );
            }

            // Apply angular velocity
            //_squid.rotation += _squid.angular_velocity;
            _squid.rotation += _squid.angular_velocity;
            if( _squid.rotation > 1 ) {
                _squid.rotation -= 1;
            } else if( _squid.rotation < 0 ) {
                _squid.rotation += 1;
            }

            // Apply angular friction
            _squid.angular_velocity *= 1 - max( 0, min( _squid.angular_friction, 1 ) );
            if( _squid.angular_velocity < 0.00001 ) {
                _squid.angular_velocity = 0;
            }

            // Run simplistic collision detection for this squid
            if( _squid.body ) {
                let colliders = listeners[ "collide" ] || {};
                let others = Object.values( colliders );
                for( let l of others ) {
                    let other = l.t;
                    if( _squid !== other ) {
                        if( collide_squids( _squid, other ) ) {
                            l.f.apply( _squid, [ _squid, other, ] );
                        }
                    }
                }
            }

        };

        // ------------------------
        // Tick / Update
        // ------------------------
        let default_tick = _squid.tick = function() {
        };


        // ------------------------
        // Animation
        // ------------------------

        let default_animate = _squid.animate = function() {
            if( _squid.anim ) 
                _squid.image = _squid.anim.next();
        };


        // ------------------------
        // Install default handlers
        // ------------------------

        _squid.listen( "physics", default_physics );
        _squid.listen( "tick", default_tick );
        _squid.listen( "animate", default_animate );
        _squid.listen( "draw", default_draw );


        // Remove from the set of all instantiated squids
        _squid.destroy = function() {
            _squid.ignore_all();
            delete all_things[ _squid.id ];
        };

        // Add to the set of all instantiated squids
        all_things[ _squid.id ] = _squid ;

    };



    //	-	-	-	-	-	-	-	-	-	-	-	-
    // Anim
    //	-	-	-	-	-	-	-	-	-	-	-	-
    
    // Create a new Anim object
    // 'imgs' is an array of image objects as created by load_image()
    const Anim = _Squids.Anim = function( imgs, fps = 10, loop = true, playing = true ) {

        const _anim = this;

        let ts_start = Date.now();

        _anim.imgs = imgs;
        _anim.loop = loop;
        _anim.playing = playing;
        _anim.fps = fps;
        _anim.frame = 0;

        _anim.play = function( start_frame = 0 ) {
            _anim.frame = start_frame;
            _anim.playing = true;
            ts_start = Date.now();
            return _anim;
        };

        _anim.restart = function() {
            return _anim.play( 0 );
        };

        _anim.stop = function() {
            _anim.playing = false;
            return _anim;
        }

        _anim.next = function() {
            if( _anim.playing ) {
                let ts_elapsed = Date.now() - ts_start;
                _anim.frame = floor( ts_elapsed / ( 1000 / fps ) );
                if( _anim.frame >= imgs.length ) {
                    // trying to step to next, non-existent frame.
                    if( _anim.loop ) {
                        // restart at the beginning
                        _anim.play( 0 );
                    } else {
                        // stop and stay on last frame
                        _anim.playing = false;
                        _anim.frame = imgs.length - 1;
                    }
                }
            }
            return imgs[ _anim.frame ];
        };

    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Simplistic collision detection support functions
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Test for circle to circle collision
    // Assumes both hit bodies are set and of the correct type
    const collide_rad_rad = function( sq1, sq2 ) {
        let scl1 = sq1.scale;
        let scl2 = sq2.scale;
        let rr = ( ( sq1.body * scl1 ) + ( sq2.body * scl2 ) );
        let rhit = rr * rr;
        let xx = abs( sq2.position.x - sq1.position.x );
        let yy = abs( sq2.position.y - sq1.position.y );
        let rdist = (xx * xx) + (yy * yy);
        return rdist < rhit;
    };

    // Test for rect to circle collision
    // Assumes both hit bodies are set and of the correct type
    const collide_rect_rad = function( sq1, sq2 ) {
        let scl1 = sq1.scale;
        let hw = ( sq1.body.x * scl1 ) * 0.5;
        let hh = ( sq1.body.y * scl1 ) * 0.5;
        let rad = sq2.body * sq2.scale;
        let p1x = sq1.position.x;
        let p1y = sq1.position.y;
        let p2x = sq2.position.x;
        let p2y = sq2.position.y;
        if( p2x + rad < p1x - hw )
            return false;
        if( p2x - rad > p1x + hw )
            return false;
        if( p2y + rad < p1y - hh )
            return false;
        if( p2y - rad > p1y + hh )
            return false;
        return true;
    };

    // Test for rect to rect collision
    // Assumes both hit bodiess are set and of the correct type
    const collide_rect_rect = function( sq1, sq2 ) {

        // scale up the hit rects
        let p1 = sq1.position;
        let p2 = sq2.position;
        let size1 = Vec( sq1.body ).mlt( sq1.scale );
        let size2 = Vec( sq2.body ).mlt( sq2.scale );

        let d = abs( p1.x - p2.x );
        let s = ( size1.x + size2.x ) * 0.5;
        if( d > s )
            return false;

        d = abs( p1.y - p2.y );
        s = ( size1.y + size2.y ) * 0.5;
        if( d > s )
            return false;

        return true;
    };

    // Test for a body collision between any 2 squids.
    const collide_squids = _Squids.collide_squids = function( sq1, sq2 ) {
        let sh1 = sq1.body;
        let sh2 = sq2.body;
        if( sh1 === null || sh1 === undefined || sh2 === null || sh2 === undefined ) 
            return false;	// need two actual bodies to make a collision
        if( typeof sh1 === "number" ) {
            if( typeof sh2 === "number" ) {
                // ---> sq1.circle to sq2.circle
                if( collide_rad_rad( sq1, sq2 ) ) {
                    return true;
                }
            } else {
                // ---> sq1.circle to sq2.square
                if( collide_rect_rad( sq2, sq1 ) ) {
                    return true;
                }
            }
        } else {
            if( typeof sh2 === "number" ) {
                // ---> sq1.square to sq2.circle
                if( collide_rect_rad( sq1, sq2 ) ) {
                    return true;
                }
            } else {
                // ---> sq1.square to sq2.square
                if( collide_rect_rect( sq1, sq2 ) ) {
                    return true;
                }
            }
        }
        return false;
    }

    // Test to see if a point is within a squid's body
    let pos_test_squid = null;
    _Squids.collide_pos_squid = function( pos, sq2 ) {
        let sq1 = pos_test_squid;
        if( ! sq1 ) {
            sq1 = pos_test_squid = new Squid();
            pos_test_squid.body = 1;
        }
        sq1.position.x = pos.x;
        sq1.position.y = pos.y;
        let hit = collide_squids( sq1, sq2 );
        return hit
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Drawing loop - Driven by requestAnimationFrame()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // incremented on every draw
    _Squids.draw_count = 0;

    // create the splash screen logo and font - this should always succeed
    const squid_logo_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjM2IiBoZWlnaHQ9IjM2NyIgdmlld0JveD0iMCAwIDIzNiAzNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS4zOTQ1IDE3MS4yNjZMMTAwLjgzMSAzOC4xMDkyTDE4Mi4zNjYgMC40NTMzNjlMMTk1LjQzNyA3OS43NzE4TDE4Mi4zNjYgMTk0Ljk1N0w1NS4zOTQ1IDE3MS4yNjZaIiBmaWxsPSIjREM4NkVBIi8+CjxwYXRoIGQ9Ik01NC4xNDk3IDIyNC4yMUw3Ni41NTY1IDE4MS44ODZMMTAwLjgzMSAxODcuNDg4TDcyLjgyMiAyMjcuMzIyTDg0LjY0NzggMjYwLjMxTDEyMi42MTUgMjY3Ljc3OUwxMTkuNTAzIDMwMS4zODlMODQuNjQ3OCAyOTAuODA4TDc2LjU1NjUgMjY3Ljc3OUw1NC4xNDk3IDIyNC4yMVoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTE4MC40OTkgMjQ4LjQ4NEwxNTkuMzM3IDIwNS41MzhMMTM1LjA2MyAxOTguMDY5TDE2My42OTQgMjU1LjMzMUwxMzUuMDYzIDMyMy43OTZIMTE1Ljc2OEw4NC42NDc4IDM2My4wMDhMMTE5LjUwMyAzNjYuNzQyTDEyOC4yMTcgMzQ1LjU4TDE1Mi40OTEgMzI4Ljc3NUwxODAuNDk5IDI0OC40ODRaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik05NC42MDY0IDIxNC44NzRMMTA3LjY3NyAxOTIuNDY3TDExNS43NjggMTk4LjA2OUwxMDcuNjc3IDIxOC42MDhMMTAwLjgzMSAyNDguNDg0TDk0LjYwNjQgMjE0Ljg3NFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTEzNS4wNjMgMjA1LjUzOEwxMjQuNDgyIDIwOC4wMjdMMTI4LjIxNyAyMzEuMDU3TDEzNS4wNjMgMjU1LjMzMUwxNDAuNjY1IDIzNC43OTFMMTM1LjA2MyAyMDUuNTM4WiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMzIuOTg3OCAxOTguMDY5TDYwLjM3MzggMTg3LjQ4OEw0Ni42ODA4IDE3Ni45MDdMMTguNjcyMyAxODcuNDg4TDAgMjUyLjIxOEwzMi45ODc4IDE5OC4wNjlaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik0yMDQuNzczIDIwNS41MzhMMTgzLjYxMSAyMDguMDI3TDIxOS43MTEgMjQ4LjQ4NFYyOTAuODA4TDIzNS44OTQgMjQ4LjQ4NEwyMDQuNzczIDIwNS41MzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik04NC42NDc4IDEyOC45ODFMMTAwLjgzMSAxMTkuMDIzTDEyMi42MTUgMTMzLjMzOEw5NC42MDY0IDE1My44NzhMODQuNjQ3OCAxMjguOTgxWiIgZmlsbD0iIzkzMzBBNCIvPgo8cGF0aCBkPSJNMTM1LjA2MyAxNTMuODc4TDE1Mi40OTEgMTMzLjMzOEwxNzEuMTYzIDE1Ny42MTJMMTUyLjQ5MSAxNzMuMTcyTDEzNS4wNjMgMTUzLjg3OFoiIGZpbGw9IiM5MzMwQTQiLz4KPHBhdGggZD0iTTIxMC4zNzUgMTMzLjMzOEwxOTQuMTkyIDE0Ny42NTRMMjAxLjY2MSA5NC43NDg2TDIxMy40ODcgMTA0LjA4NUwyMTAuMzc1IDEzMy4zMzhaIiBmaWxsPSIjOTMzMEE0Ii8+CjxwYXRoIGQ9Ik02MC4zNzM4IDExOS4wMjNMODEuNTM1OCA3MC40NzQ2TDYwLjM3MzggNzYuNjk4N0w1MS4wMzc3IDEwNC4wODVMNjAuMzczOCAxMTkuMDIzWiIgZmlsbD0iIzkzMzBBNCIvPgo8L3N2Zz4K";
    let squid_logo = null; 
    load_image( squid_logo_url, img => { squid_logo = img; }, console.error );
    const squid_logo_font_big = load_font( "helvetica", 28, "#fff" );
    const squid_logo_font_small = load_font( "helvetica", 16, "#fff" );

    // draw the splash screen
    const draw_splash = function() {
        let sw = canvas.clientWidth;
        let sh = canvas.clientHeight;
        draw_rect_filled( 0, 0, sw, sh, "#000");
        if( squid_logo ) {
            // logo has loaded
            let dx = ( sw - squid_logo.w ) * 0.5;
            let dy = ( sh - squid_logo.h ) * 0.25;
            draw_image( squid_logo, dx, dy );
        }
        draw_text( "sleepless.com", sw * 0.5, sh * 0.75, squid_logo_font_big, "center", 1.0 );
        draw_text( "Squids " + _Squids.version + " (" + _Squids.code_name + ")", sw * 0.5, sh * 0.90, squid_logo_font_small, "center", 0.6 );
        draw_text( "Copyright 2025 - Sleepless Inc. All - Rights Reserved.", sw * 0.5, sh * 0.95, squid_logo_font_small, "center", 0.6 );
    };

    // Draws the overlay debug strings
    const draw_debug = function() {
        let y = DBG_LINE_HEIGHT;
        for( let m of dbg_msgs ) {
            if( m === undefined )
                m = ""
            draw_text( m, DBG_FONT_SIZE, y + DBG_SHADOW_OFFSET, dbg_font_shadow, "left", 0.9 );
            draw_text( m, DBG_FONT_SIZE, y, dbg_font, "left", 0.9 );
            y += DBG_LINE_HEIGHT;
        }
    };

    // The initial, default on_draw() function
    _Squids.on_draw = function( draw_count ) {
        if( _Squids.splashing ) {
            draw_splash();
        } else {        
            // clear canvas
            draw_rect_filled( 0, 0, _screen.width, _screen.height, "#000");
            emit( "draw", draw_count );
            if( dbg_flag ) {
                draw_debug();
            }
         }
    };

    // *** what requestAnimationFrame() calls ***
    const _DRAW = function() {
        _Squids.draw_count += 1;
        _Squids.on_draw( _Squids.draw_count );
        requestAnimationFrame( _DRAW );
    };


    //	-	-	-	-	-	-	-	-	-	-	-	-	-
    // Tick loop
    // Driven by setInterval()
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    _Squids.tick_count = 0;			// increments each time a "tick" event is emitted

    const IDEAL_TPS = 100;      // target ticks per second
    let ts_last = Date.now();

    _Squids.splashing = 300;        // Timer for Squids splash screen

    // The initial, default on_tick() function
    _Squids.on_tick = function( delta, tick_count) {
        if( _Squids.splashing > 0 ) {
            _Squids.splashing -= 1;
        } else {
            emit( "physics" );
            emit( "tick", delta, tick_count );
            emit( "animate" );
        }
    };

    // What setInterval() calls
    const _TICK = function() {
        _Squids.tick_count += 1;

        //  cushions against many resize events in a row
        if( resizing_count > 0 ) {
            resizing_count -= 1;
            if( resizing_count == 0 ) {
                set_canvas( canvas || created_canvas );
                emit( "resize", _screen.width, _screen.height );
            }
        }

        let ts_now = Date.now();
        let delta = ts_now - ts_last;
        ts_last = ts_now;

        _Squids.on_tick( delta, _Squids.tick_count );
    }

    
    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    //_Squids.stats = { tps: 0, fps: 0 };
    Object.defineProperty( _Squids, "stats", { value: { tps: 0, fps: 0 }, writable: false, } );

    //  updates ticks and frames per sec values
    let last_tick_count = _Squids.tick_count;
    let last_draw_count = _Squids.draw_count;
    let stats_tid = setInterval( () => {
        _Squids.stats.fps = _Squids.draw_count - last_draw_count;
        last_draw_count = _Squids.draw_count;
        _Squids.stats.tps = _Squids.tick_count - last_tick_count;
        last_tick_count = _Squids.tick_count;
    }, 1000 );


    // call this if you want to kill this instance of Squids and anything that it's doing
    _Squids.shutdown = function() {
        clearInterval( stats_tid );
        clearInterval( tick_tid );
        cancelAnimationFrame( draw_tid );
        remove_ptr_event_handlers();
        remove_key_event_handlers();
        remove_general_event_handlers();
        stop_audio();
        destroy_things();
    }


    //	-	-	-	-	-	-	-	-	-	-	-	-	-

    // Let's fire up the bloody jet!
    set_canvas( _canvas );
    let tick_tid = setInterval( _TICK, 1000 / IDEAL_TPS );
    let draw_tid = requestAnimationFrame( _DRAW );

}


