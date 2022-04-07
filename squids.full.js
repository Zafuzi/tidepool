/**

@preserve

Copyright 2021 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 

*/

(function() {

	let M = {};

	let isBrowser = typeof global === "undefined";
	let isNode = ! isBrowser;

	// for convenience
	M.log = function(m) {
		if(isBrowser && window["console"] === undefined) {
			return;		// console doesn't exist in IE unless in debug mode
		}
		if(typeof m === "object") {
			return console.dir( m );
		}
		return console.log(m);
	}


	// throw an error if a condition is true
	M.throwIf = function(c, s) { if(c) { throw new Error(s || "FAILED ASSERTION"); } }


	// convert and return json as object or null if exception
	M.j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }

	// convert and return object as JSON or null if exception
	M.o2j = function(o) { try { return JSON.stringify(o) } catch(e) { return null } }


	// convert whatever to float or 0 if not at all numberlike
	// E.g. "123.9" --> 123.9, null --> 0.0, undefined --> 0.0, NaN --> 0.0, 123.9 --> 123.9
	M.toFlt = function(v) {
		return parseFloat((""+v).replace(/[^-.0-9]/g, "")) || 0.0;
	}

	// convert whatever to integer or 0 if not at all numberlike
	// E.g. "123" --> 123, null --> 0, undefined --> 0, NaN --> 0, 123 --> 123, -123.9 --> -124
	M.toInt = function(v) {
		var n = M.toFlt(v);
		return Math[n < 0 ? 'ceil' : 'floor'](n);
	};


	// convert from pennies to dollars
	// E.g.  123456 --> 1234.56
	M.centsToBucks = function(cents) {
		return M.toFlt( M.toInt(cents) / 100 );
	}
	M.c2b = M.centsToBucks;

	// convert dollars to pennies
	// E.g.  1234.56 --> 123456
	M.bucksToCents = function(bucks) {
		return Math.round( (M.toFlt(bucks) * 1000) / 10 );
	}
	M.b2c = M.bucksToCents;


	// format a number into a string with any # of decimal places,
	// and optional alternative decimal & thousand-separation chars
	// numFmt( 1234.56 )	// "1,235"
	// numFmt( 1234.56, 1 )	// "1,234.6"
	// numFmt( 1234.56, 1, "," )	// "1,234,6"
	// numFmt( 1234.56, 1, "_" )	// "1,234_6"
	// numFmt( 1234.56, 1, ",", "." )	// "1.234,6"
	// numFmt( 1234.56, 1, ".", "" )	// "1234.6"
	M.numFmt = function(n, plcs, dot, sep) {
		n = M.toFlt(n);
		sep = typeof sep === "string" ? sep : ",";			// thousands separator char
		dot = typeof dot === "string" ? dot : ".";			// decimal point char
		plcs = M.toInt(plcs);
		var p = Math.pow(10, plcs);
		var n = Math.round( n * p ) / p;
		var sign = n < 0 ? '-' : '';
		n = Math.abs(+n || 0);
		var intPart = parseInt(n.toFixed(plcs), 10) + '';
		var j = intPart.length > 3 ? intPart.length % 3 : 0;
		return sign +
			(j ? intPart.substr(0, j) + sep : '') +
			intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + sep) +
			(plcs ? dot + Math.abs(n - intPart).toFixed(plcs).slice(-plcs) : '');
	}

	// fraction to percent.
	// convert something like 0.12 to a string that looks like "12" with
	// optional alternate decimal and thousands-seperator chars
	// NOTE: there is no "%" added, you have to do that yourself if you want it.
	// toPct( 0.4 ) + "%"		// "40%"
	// toPct( 123.4,",", "." )	// "12,340"
	M.toPct = function(n, plcs, dot, sep) {
		return M.numFmt(n * 100, plcs, dot, sep);
	}


	// Convert whatever to a string that looks like "1,234.56"
	// Add the $ symbol yourself.
	// E.g. toMoney( 1234.56 )				// "1,234.56"
	// E.g. toMoney( 1234.56, 1, ".", "" )	// "1.234,56"
	M.toMoney = function(n, dot, sep) {
		return M.numFmt(n, 2, dot, sep);
	}


	// Returns a human readable string that describes 'n' as a number of bytes,
	// e.g., "1 KB", "21.5 MB", etc.
	M.byteSize = function(sz) {
		if(typeof sz != "number")
			return sz;
		if(sz < 1024)
			return M.numFmt(sz, 0) + " B"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " KB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " MB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " GB"
		sz = sz / 1024
		return M.numFmt(sz, 1) + " TB"
	}


	// Return a Unix timestamp for current time, or for a Date object if provided
	M.time = function( dt ) {
		if( ! dt ) dt = new Date();
		return M.toInt( dt.getTime() / 1000 );
	}


	// Convert "YYYY-MM-YY" or "YYYY-MM-YY HH:MM:SS" to Unix timestamp
	M.my2ts = function(m) {
		if( m.length == 10 && /\d\d\d\d-\d\d-\d\d/.test(m) ) {
			m += " 00:00:00";
		}
		if(m === "0000-00-00 00:00:00") {
			return 0;
		}
		var a = m.split( /[^\d]+/ );
		if(a.length != 6) {
			return 0;
		}
		var year = M.toInt(a[0]);
		var month = M.toInt(a[1]);
		var day = M.toInt(a[2]);
		var hour = M.toInt(a[3]);
		var minute = M.toInt(a[4]);
		var second = M.toInt(a[5]);
		var d = new Date(year, month - 1, day, hour, minute, second, 0);
		return M.toInt(d.getTime() / 1000);
	}

	// Convert Unix timestamp to "YYYY-MM-DD HH:MM:SS"
	M.ts2my = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		return ""+
			d.getFullYear()+
			"-"+
			("0"+(d.getMonth() + 1)).substr(-2)+
			"-"+
			("0"+d.getDate()).substr(-2)+
			" "+ 
			("0"+d.getHours()).substr(-2)+
			":"+
			("0"+d.getMinutes()).substr(-2)+
			":"+
			("0"+d.getSeconds()).substr(-2)+
			"";
	}

	// Convert Unix timestamp to Date object
	// Returns null (NOT a date object for "now" as you might expect) if ts is falsey.
	M.ts2dt = function(ts) {
		ts = M.toInt(ts);
		return ts ? new Date(ts * 1000) : null;
	};

	// Convert Date object to Unix timestamp
	M.dt2ts = function(dt) {
		if(! (dt instanceof Date) )
			return 0;
		return M.toInt(dt.getTime() / 1000);
	};

	// Convert "MM/DD/YYYY HH:MM:SS" to Date object or null if string can't be parsed
	// If year is 2 digits, it will try guess the century (not recommended).
	// Time part (HH:MM:SS) can be omitted and seconds is optional
	// if utc argument is truthy, then return a UTC version
	M.us2dt = function(us, utc) {

		if(!us) {
			return null;
		}

		var m = (""+us).split( /[^\d]+/ );

		if(m.length < 3) {
			return null;
		}
		while(m.length < 7) {
			m.push("0");
		}

		// try to convert 2 digit year to 4 digits (best guess)
		var year = M.toInt(m[2]);
		var nowyear = new Date().getFullYear();
		if(year <= ((nowyear + 10) - 2000))
			year = 2000 + year;
		if(year < 100)
			year = 1900 + year;

		var mon = M.toInt(m[0]) - 1;
		var date = M.toInt(m[1]);

		var hour = M.toInt(m[3]);
		var min = M.toInt(m[4]);
		var sec = M.toInt(m[5]);
		var ms = M.toInt(m[6]);

		if(utc) {
			return new Date(Date.UTC(year, mon, date, hour, min, sec, ms));
		}

		return new Date(year, mon, date, hour, min, sec, ms);
	}

	// Convert "MM/DD/YYYY HH:MM:SS" to Unix timestamp.
	// If utc argument is truthy, then return a UTC version.
	M.us2ts = function(us, utc) {
		return M.dt2ts(M.us2dt(us, utc));
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM:SS".
	M.ts2us = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		return ""+
			("0"+(d.getMonth() + 1)).substr(-2)+
			"/"+
			("0"+d.getDate()).substr(-2)+
			"/"+
			d.getFullYear()+
			" "+ 
			("0"+d.getHours()).substr(-2)+
			":"+
			("0"+d.getMinutes()).substr(-2)+
			":"+
			("0"+d.getSeconds()).substr(-2)+
			"";
	}

	// Convert Unix timestamp to "MM/DD".
	M.ts2us_md = function(ts) {
		return M.ts2us(ts).substr(0, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY".
	M.ts2us_mdy = function(ts) {
		return M.ts2us(ts).substr(0, 10);
	}

	// Convert Unix timestamp to "MM/DD/YY"
	M.ts2us_mdy2 = function(ts) {
		var a = M.ts2us_mdy(ts).split("/");
		if(a.length != 3) {
			return a;
		}
		a[2] = a[2].substr(2);
		return a.join("/");
	}

	// Convert Unix timestamp to "HH:MM"
	M.ts2us_hm = function(ts) {
		return M.ts2us(ts).substr(11, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM"
	M.ts2us_mdyhm = function(ts) {
		return M.ts2us_mdy(ts) + " " + M.ts2us_hm(ts);
	}

	// Convert Unix timestamp to "MM/DD/YY HH:MM"
	M.ts2us_mdy2hm = function(ts) {
		return M.ts2us_mdy2(ts) + " " + M.ts2us_hm(ts);
	}

	// Convert Unix timestamp to something like "01-Jan-2016"
	M.ts2us_dMy = function(ts) {
		var d = M.ts2dt(ts);
		if(!d) {
			return "";
		}
		var month_names = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
		return ""+
			("0"+d.getDate()).substr(-2)+
			"-"+
			month_names[d.getMonth()]+
			"-"+
			d.getFullYear();
	}


	// return an array containing only distinct values.
	// E.g.  [ 1,2,2 ].distinct()		// [1,2]
	Array.prototype.distinct = function( cb ) {
		let hash = {};
		for( let el of this ) {
			hash[ cb ? cb( el ) : (""+el) ] = true;
		}
		return Object.keys( hash );
	}


	// Make all lowercase
	// E.g.  "Foo".lcase()		// "foo"
	String.prototype.lcase = function() { return this.toLowerCase() }

	// Make all uppercase
	// E.g.  "Foo".ucase()		// "FOO"
	String.prototype.ucase = function() { return this.toUpperCase() }

	// Capitalize first word
	// E.g.  "foo bar".ucfirst()		// "Foo bar"
	String.prototype.ucfirst = function() {
		return this.substring(0,1).toUpperCase() + this.substring(1)
	}

	// Capitalize all words
	// E.g.  "foo bar".ucwords()		// "Foo Bar"
	String.prototype.ucwords = function( sep ) {
		sep = sep || /[\s]+/;
		var a = this.split( sep );
		for( var i = 0; i < a.length; i++ ) {
			a[ i ] = a[ i ].ucfirst();
		}
		return a.join( " " );
	}

	// Returns true if the string begins with the prefix string
	// E.g.	"Foobar".startsWith( "Foo" ) 		// true
	// E.g.	"foobar".startsWith( "Foo" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.startsWith === undefined ) {
		String.prototype.startsWith = function(prefix) {
			return this.substr(0, prefix.length) == prefix;
		}
	}

	// Returns true if the string ends with the suffix string
	// E.g.	"Foobar".endsWith( "bar" ) 		// true
	// E.g.	"foobar".endsWith( "Bar" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.endsWith === undefined ) {
		String.prototype.endsWith = function(suffix) {
			return this.substr(-suffix.length) == suffix;
		}
	}

	// Abbreviate to 'l' chars with ellipses
	// E.g. "Foo bar baz".abbr(6)  // "Fo ..."
	String.prototype.abbr = function(l) {
		l = M.toInt(l) || 5;
		if(this.length <= l) {
			return "" + this;	// Cuz ... some times this === a String object, not a literal
		}
		return this.substr(0, l - 4) + " ...";
	}

	// Convert a string from something like "prof_fees" to "Prof Fees"
	String.prototype.toLabel = function() {
		var s = this.replace( /[_]+/g, " " );
		s = s.ucwords();
		return s;
	}

	// Convert a string from something like "Prof. Fees" to  "prof_fees"
	String.prototype.toId = function() {
		var s = this.toLowerCase();
		s = s.replace( /[^a-z0-9]+/g, " " );
		s = s.trim();
		s = s.replace( /\s+/g, "_" );
		return s;
	}

	// Returns true if string contains all of the arguments irrespective of case
	// "I,\nhave a lovely bunch of coconuts".looksLike("i have", "coconuts") == true
	String.prototype.looksLike = function() {
		var a = Array.prototype.slice.call(arguments);        // convert arguments to true array
		var s = "_" + this.toId() + "_"; //.split("_"); //toLowerCase();
		for(var i = 0; i < a.length; i++) {
			var t = "_" + (a[i].toId()) + "_";
			if(s.indexOf(t) == -1)
				return false;
		}
		return true;
	}

	// Returns true if the string looks like a valid email address
	String.prototype.is_email = function() {
		return /^[A-Za-z0-9_\+-]+(\.[A-Za-z0-9_\+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$/.test(this);
	}

	// Create this:
	//String.prototype.is_url = function() {
	//}


	// Returns a human readable relative time description for a Unix timestmap versus "now"
	// E.M. agoStr( time() - 60 ) 	// "60 seconds ago"
	// E.M. agoStr( time() - 63 ) 	// "1 minute ago"
	// Pass a truthy value for argument 'no_suffix' to suppress the " ago" at the end
	M.agoStr = function(ts, no_suffix) {
		if(ts == 0)
			return "";

		var t = M.time() - ts;
		if(t < 1)
			return "Just now";

		var v = ""
		var round = Math.round
			
		if(t>31536000) v = round(t/31536000,0)+' year'; 
		else if(t>2419200) v = round(t/2419200,0)+' month'; 
		else if(t>604800) v = round(t/604800,0)+' week'; 
		else if(t>86400) v = round(t/86400,0)+' day'; 
		else if(t>3600) v = round(t/3600,0)+' hour'; 
		else if(t>60) v = round(t/60,0)+' minute'; 
		else v = t+' second'; 
			
		if(M.toInt(v) > 1)
			v += 's'; 

		return v + (no_suffix ? "" : " ago");
	}

	
	/*
	Run some functions in parallel, e.g:

		runp()						// create a runner object

		.add(function(cb) {			// add a simple function that does something
			// do something.
			cb();	// call this when it's done
		})

		.add(function(cb, str) {	// pass in an argument and also return an error
			// str == "foo"
			cb("error "+str);
		}, "foo")

		.add(function(cb, str1, str2) {		// pass in multiple args
			// str1 == "bar", str2 = "baz"
			cb(null, "okay "+str1+" "+str2);
		}, "bar", "baz")

		.add( [ 7, 11 ], function( cb, num, str ) {		// call the func once for each item in an array
			// this function called twice once with num = 7 and once with num = 11
			// both times str = "qux"
			cb(null, "okay "+num+" "+str);
		}, "qux")

		// All the calls are set up but nothing happens until
		// I call run() on the runner object, at which point all the functions
		// will be fired off in parallel.  When they're all completed (okay or fail)
		// the the call back calls you with an array of errors and results.

		.run(function(errors, results) {
			// all the functions have completed
			// errors = [null, "error foo", null, null, null ];
			// results = [null, null, "okay bar baz", "okay 7 qux", "okay 11 qux" ];
		})
	*/
	M.runp = function() {
		var o = {};
		var q = [];

		// Adds a function to the runp object
		var add = function add() {
			let args = Array.prototype.slice.call(arguments);
			if( typeof args[ 0 ] === "function" ) {
				q.push( args );
				return o;
			}
			// assume it's an array and and 2nd arg is function
			let arr = args.shift();
			let fun = args.shift();
			arr.forEach( x => {
				q.push( [ fun, x ].concat( args ) );
			});
			return o;
		};

		// Starts all the functions at once
		var run = function(cb) {
			var errors = [];
			var results = [];
			var num_done = 0;
			if( q.length == 0 ) {
				if(cb) {
					cb(errors, results);
				}
				return;
			}
			q.forEach(function(args, i) {
				let fun = args.shift();
				// Call each function with a callback and an index # (0-based)
				// The callback expect err, and result arguments.
				args.unshift( function(e, r) {
					// One of the functions is finished
					errors[i] = e || null;
					results[i] = r || null;
					num_done += 1;
					// when all finished, call the cb that was passed into run() with 
					// a list of errors and results.
					if(num_done == q.length) {
						if(cb) {
							cb(errors, results);
						}
					}
				} );
				fun.apply( null, args );
			});
		};

		o.add = add;
		o.run = run;
		return o;
	}

	/*
	Run a queue of functions sequentially, e.g:
		runq()
		.add(function(cb, a) {
			cb(null, a + 1);
		})
		.add(function(cb, a) {
			cb(null, a + 1);
		})
		.run(function(err, r) {
			// all done
			if(err) {
				// ...
			}
			else {
				console.log(a);		// 3
			}
		}, 1)
	*/
	M.runq = function() {
		var o = {};
		var q = []
		var add = function(f) {
			q.push(f);
			return o;
		};
		var run = function(cb, arg) {
			if(q.length == 0) {
				cb(null, arg);
				return;
			}
			var f = q.shift();
			f(function(e, arg) {
				if(e) {
					q = [];
					cb(e, arg);
				}
				else {
					run(cb, arg);
				}
			}, arg);
		};
		o.add = add
		o.run = run
		return o
	}


	// Sort of like Markdown, but not really.
	M.t2h = function( t ) {

		// nuke CRs
		t = t.replace(/\r/gi, "\n")

		// remove leading/trailing whitespace on all lines
		t = t.split( /\n/ ).map( l => l.trim() ).join( "\n" );

		// append/prepend a couple newlines so that regexps below will match at beginning and end
		t = "\n\n" + t + "\n\n";		// note: will cause a <p> to always appear at start of output

		// hyper link/anchor
		// (link url)
		// (link url alt_display_text)
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*\)/gi, "<a href=\"$1\">$1</a>");
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a href=\"$1\">$2</a>");

		// hyper link/anchor that opens in new window/tab
		// (xlink url)
		// (xlink url alt_display_text)
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*\)/gi, "<a target=_blank href=\"$1\">$1</a>");
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a target=_blank href=\"$1\">$2</a>");

		// image
		// (image src title)
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*\)/gi, "<img src=\"$1\">");
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<img src=\"$1\" title=\"$2\">");

		// figure
		// (figure src caption)
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*\)/gi, "(figure $1 $1)");
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<figure><img src=\"$1\" title=\"$2\"><figcaption>$2</figcaption></figure>");

		// symbols
		// (tm)	
		// (r)
		// (c)
		// (cy)				"(C) 2021"
		// (cm Foocorp)		"(C) 2021 Foocorp All Rights Reserved"
		t = t.replace(/\(tm\)/gi, "&trade;");	
		t = t.replace(/\(r\)/gi, "&reg;");	
		t = t.replace(/\(c\)/gi, "&copy;");
		t = t.replace(/\(cy\)/gi, "&copy;&nbsp;"+(new Date().getFullYear()));
		t = t.replace(/\(cm\s([^)]+)\)/gi, "&copy;&nbsp;"+(new Date().getFullYear())+"&nbsp;$1&nbsp;&ndash;&nbsp;All&nbsp;Rights&nbsp;Reserved" )

		// one or more blank lines mark a paragraph
		t = t.replace(/\n\n+/gi, "\n\n<p>\n");
		
		// headings h1 and h2
		// Heading 1
		// =========
		// Heading 2
		// ---------
		// Heading 3
		// - - - - -
		// Heading 4
		// -  -  -  -  -
		// Heading 5
		// -   -   -   -   -
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s\s){4,}-\n/gi, "\n<h5>$1</h5>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s){4,}-\n/gi, "\n<h4>$1</h4>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s){4,}-\n/gi, "\n<h3>$1</h3>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n-{5,}\n/gi, "\n<h2>$1</h2>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n={5,}\n/gi, "\n<h1>$1</h1>\n" );

		// styles
		// //italic//
		// **bold**
		// __underline__
		t = t.replace(/([^:])\/\/(.*)\/\//gi, "$1<i>$2</i>");
		t = t.replace(/\*\*(.*)\*\*/gi, "<b>$1</b>");
		t = t.replace(/__(.*)__/gi, "<u>$1</u>");

		// "
		// block quote text
		// "
		t = t.replace(/\n\s*"\s*\n([^"]+)"\s*\n/gi, "\n<blockquote>$1</blockquote>\n");	// blockquote

		// >
		// centered text
		// >
		t = t.replace(/\n\s*>\s*\n([^>]+)>\s*\n/gi, "\n<div style='text-align:center;'>$1</div>\n");

		// >>
		// right justified text
		// >>
		t = t.replace(/\n\s*>>\s*\n([^>]+)>>\s*\n/gi, "\n<div style='text-align:right'>$1</div>\n");

		// {
		// code
		// }
		// foo { code } bar
		t = t.replace(/\n\s*{\s*\n([^"]+)}\s*\n/gi, "\n<blockquote><code>$1</code></blockquote>\n");
		t = t.replace(/{([^}]+)}/gi, "<code>$1</code>");	// code

		// Unordered list
		// - item 
		// - item
		t = t.replace(/\n((\s*-\s+[^\n]+\n)+)/gi, "\n<ul>\n$1\n</ul>");
		t = t.replace(/\n\s*-\s+/gi, "\n<li>");

		// Ordered list 
		// 1. item 1
		// # item 2
		// 1. item 3
		t = t.replace(/\n((\s*(\d+|#)\.?\s+[^\n]+\n)+)/gi, "\n<ol>\n$1\n</ol>");
		t = t.replace(/\n(\d+|#)\.?\s+([^\n]+)/gi, "\n<li>$2</li>");

		// Horiz. rule
		// ---- (4 or more dashes)
		t = t.replace(/\n\s*-{4,}\s*\n/gi, "\n<hr>\n");		// horizontal rule

		// Dashes
		// --  (n-dash)
		// ---  (m-dash)
		t = t.replace(/-{3}/gi, "&mdash;");		// mdash
		t = t.replace(/-{2}/gi, "&ndash;");		// ndash

		if( typeof navigator !== "undefined" ) {
			// Only supported if running in browser

			// (lastModified)		// last modified data of document.
			t = t.replace(/\(\s*lastModified\s*\)/gi, document.lastModified);
		}

		return t;
	};


	// The inimitable Log5 ...
	(function() {
		var util = null;
		var style = null;
		if( isNode ) {
			util = require( "util" );
			// style = require( "./ansi-styles.js" );
		}
		const n0 = function(n) {
			if(n >= 0 && n < 10)
				return "0"+n
			return n
		}
		const ts = function() {
			var d = new Date()
			return d.getFullYear() + "-" +
				n0(d.getMonth()+1) + "-" +
				n0(d.getDate()) + "_" +
				n0(d.getHours()) + ":" +
				n0(d.getMinutes()) + ":" +
				n0(d.getSeconds())

		}
		const mkLog = function(prefix) {
			prefix = " " + (prefix || "")
			var o = {}
			o.logLevel = 0
			var f = function logFunc( l ) {
				var n = 0, ll = l
				if( typeof l === "number" ) {	// if first arg is a number ...
					if(arguments.length == 1) {	// and it's the only arg ...
						o.logLevel = l			// set logLevel to l
						return logFunc			// and return
					}
					// there are more args after the number
					n = 1	// remove the number from arguments array
				}
				else {
					ll = 0	// first arg is not number, log level for this call is 0
				}
				if( o.logLevel < ll )	// if log level is below the one given in this call ...
					return logFunc;		// just do nothing and return 
				let s = ts() + prefix;
				for( var i = n; i < arguments.length; i++ ) {	// step through args
					let x = arguments[ i ];
					if( x === undefined ) {
						x = "undefined";
					}
					if( typeof x === "object" ) {	// if arg is an object ...
						if( isNode ) {				// and we're in node ...
							x = util.inspect( x, { depth: 10 } );	// convert obj to formatted JSON
						} else {					// otherwise ...
							x = o2j( x );			// just convert obj to JSON
						}
					}
					s += x;					// append to the growing string
				}
				if( isNode && style ) {
					if( process.stdout.isTTY ) {
						switch( ll ) {
						case 1:
							s = `${style.red.open}${s}${style.red.close}`;
							break;
						case 2:
							s = `${style.yellow.open}${s}${style.yellow.close}`;
							break;
						case 3:
							break;
						case 4:
							s = `${style.cyan.open}${s}${style.cyan.close}`;
							break;
						case 5:
							s = `${style.magenta.open}${s}${style.magenta.close}`;
							break;
						}
					}
					process.stdout.write( s + "\n" );	// write string to stdout
				} else {
					switch( ll ) {
					case 1: console.error( s ); break;
					case 2: console.warn( s ); break;
					default: console.log( s ); break;
					}
				}
				return logFunc
			}
			f.E = function( s ) { f( 1, "******* " + s ); }    // error
			f.W = function( s ) { f( 2, "- - - - " + s ); }    // warning
			f.I = function( s ) { f( 3, s ); }                 // info
			f.V = function( s ) { f( 4, s ); }                 // verbose
			f.D = function( s ) { f( 5, s ); }                 // debug
			return f;
		}
		const defLog = mkLog("")(3);
		defLog.mkLog = mkLog;
		M.log5 = defLog;
		M.L = defLog;
	})();


	if(isNode) {
		// Node.js only stuff

		// Read a file from disk
		// Reads async if callback cb is provided,
		// otherwise reads and returns contents synchronously.
		M.getFile = function(path, enc, cb) {
			var fs = require("fs");
			if(!cb) {
				return fs.readFileSync(path, enc);
			}
			fs.readFile(path, enc, cb);
		};

		// Return ASCII sha1 for a string
		M.sha1 = function(s) {
			var h = require("crypto").createHash("sha1");
			h.update(s);
			return h.digest("hex");
		};

		// Return ASCII sha256 for a string
		M.sha256 = function(s) {
			var h = require("crypto").createHash("sha256");
			h.update(s);
			return h.digest("hex");
		};

		// DS (datastore)
		(function() {
			const fs = require( "fs" );
			const load = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				try {
					const ds = JSON.parse( fs.readFileSync( f ) );
					for( let key in ds ) 
						self[ key ] = ds[ key ];
				} catch( e ) {
					self.clear();
				} 
			}
			// this may throw exception, but it's up to caller to deal with it.
			const save = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				fs.writeFileSync( f, JSON.stringify( self ) );
			}
			const clear = function() {
				const self = this;
				for( let key in self ) 
					delete self[ key ];
			}
			const ldsv = { load:load, save:save, clear:clear }
			const F = function( file, opts ) {
				var self = this;
				self.file = file;
				self.opts = opts || {};
			}
			F.prototype = ldsv;
			const D = function( f, opts ) {
				const self = this;
				self.__proto__ = new F( "ds.json", opts );
				self.load( f );
			}
			D.prototype = new F();
			M.DS = D
		})();


		M.rpc = function( url, data, okay = ()=>{}, fail = ()=>{}, _get = false, _redirects = 0 ) {
			if( _get ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			// check for looping
			_redirects = M.toInt( _redirects );
			if( _redirects > 10 ) {
				fail( "Too many redirects" ); // methinks we loopeth
				return;
			}
			const method = _get ? "GET" : "POST";
			let opts = {
				method: method,
				headers: {
					"Content-Type": "application/json",	// will always send this, and ...
					"Accept": "application/json",		// will accept this in response
				}
			};
			let json = "";	// collected response
			let req = require( "https" ).request( url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {	// if it's an "okay" ...
						okay( M.j2o( json ), res );		// done!
					} else {
						if( statusCode >= 300 && statusCode < 400 ) {	// if it's a redirect ...
							let url = headers[ "location" ] || headers[ "Location" ];	// get new url
							M.rpc( url, okay, fail, _get, _redirects + 1 );	// recursively try the new location
						} else {	// otherwise ...
							fail( "HTTP Error "+statusCode, json, req );	// just give up.
						}
					}
				});
			});
			req.on( "error", fail );
			req.write( _get ? "" : o2j( data ) );
			req.end();
		};


		// This is a connect/express middleware that creates okay()/fail() functions on the response
		// object for responding to an HTTP request with a JSON payload.
		// XXX This may not really belong in sleepless.js
		M.mw_fin_json = function( req, res, next ) {
			res.done = ( error, data ) => {
				let json = JSON.stringify( { error, data } );
				res.writeHead( 200, { "Content-Type": "application/json", });
				res.write( json );
				res.end();
			};
			res.fail = ( error, body ) => { res.done( error, body ); };
			res.okay = ( data ) => { res.done( null, data ); };
			next();
		};

	} else {
		// Browser only stuff

		M.LS = {
			// XXX Add ttl feature
			get: function( k ) {
				try {
					return j2o( localStorage.getItem( k ) );
				} catch( e ) { }
				return null;
			},
			set: function( k, v ) {
				try {
					return localStorage.setItem( k, o2j( v ) );
				} catch( e ) { }
				return null;
			},
			clear: function() {
				return localStorage.clear();
			}
		};

		// Navigate to new url
		M.jmp = function(url) { document.location = url; };

		// Reload current page
		M.reload = function() { document.location.reload(); };


		// Make an async HTTP GET request for a URL
		M.getFile = function(url, cb) {
			var x = new XMLHttpRequest();
			x.onload = function() { cb(x.responseText, x); };
			x.open("GET", url);
			x.send();
		};

		M.rpc = function( url, data, okay = ()=>{}, fail = ()=>{}, _get = false ) {
			if( _get ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			const method = _get ? "GET" : "POST";
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				let r = M.j2o( xhr.responseText );
				if( ! r ) {
					fail( "Error parsing response from server." );
					return;
				}
				if( r.error ) {
					fail( r.error );
					return;
				}
				okay( r.data, xhr );
			};
			xhr.onerror = fail;
			xhr.open( method, url );
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.setRequestHeader( "Accept", "application/json" );
			if( method == "POST" && data ) {
				xhr.send( M.o2j( data ) );
			} else {
				xhr.send();
			}
		};


		// Returns an object constructed from the current page's query args.
		M.getQueryData = function() {
			var o = {};
			var s = document.location.search;
			if(s) {
				var kv = s.substr(1).split("&")
				for(var i = 0; i < kv.length; i++) {
					var aa = kv[i].split("=");
					o[aa[0]] = decodeURIComponent(aa[1]);
				}
			}
			return o
		};


		// Convert HTMLCollection to normal array
		HTMLCollection.prototype.toArray = function() {
			let arr = [];
			for(let i = 0; i < this.length; i++) {
				arr.push( this[ i ]);
			}
			return arr;
		};

		// Convert NodeList to normal array
		NodeList.prototype.toArray = HTMLCollection.prototype.toArray;

		// Add a class to an element
		HTMLElement.prototype.addClass = function(c) {
			let cl = this.classList;
			if( ! cl.contains( c ) )
				cl.add( c );
			return this;
		};

		// Remove a class from an element
		HTMLElement.prototype.remClass = function(c) {
			let cl = this.classList;
			if( cl.contains( c ) )
				cl.remove( c );
			return this;
		};

		// Return all elements matching query selector as an array
		M.QS = function( qs ) {
			return document.querySelectorAll( qs ).toArray();
		};

		// Return first element matching query selector
		M.QS1 = function( qs ) {
			return M.QS( qs )[ 0 ];
		};

		// Find all child elements matching query selector
		HTMLElement.prototype.find = function( qs ) {
			return this.querySelectorAll( qs ).toArray();
		}

		// Find first child element matching query selector
		HTMLElement.prototype.find1 = function( qs ) {
			return this.find( qs )[ 0 ];
		}

		// Get (or set if v is provided) an attribute's value
		HTMLElement.prototype.attr = function(a, v) {
			if(v !== undefined) {
				this.setAttribute(a, v);
				return this;
			}
			else {
				return this.getAttribute(a);
			}
		};

		// Get (or set if v is provided) an element's value
		HTMLElement.prototype.val = function(v) {
			if(v !== undefined) {
				this.value = v;
				return this;
			}
			else {
				return (this.value || "").trim();
			}
		};

		// Get (or set if h is provided) an element's innerHTML
		HTMLElement.prototype.html = function(h) {
			if(h !== undefined) {
				this.innerHTML = h;
				return this;
			}
			else {
				return this.innerHTML;
			}
		};

		// handy thing to grab the data out of a form
		HTMLFormElement.prototype.getData = function() {
			const types = "input select textarea".toUpperCase().split( " " );
			let data = {};
			for( let i = 0 ; i < this.elements.length ; i++ ) {
				const e = this.elements[ i ];
				if( types.includes( e.tagName ) ) {
					data[ e.name ] = e.value;
				}
			}
			return data;
		};

		// Takes an object, copies values into matching named form fields,
		// then sets onchange handlers that update the object values.
		HTMLFormElement.prototype.setData = function( d, change_cb ) {
			for( let e of this.elements ) {
				let k = e.name;
				if( d[ k ] !== undefined ) {
					let v = d[ k ];
					if( e.type == "checkbox" )
						e.checked = !! v;
					else
						e.value = v;
					e.onchange = evt => {
						let v = e.value;
						if( e.type == "checkbox" )
							v = !! e.checked;
						d[ k ] = v;
						if( change_cb )
							change_cb( evt );
					};
				}
			}
		};




		// ---------------------------------------
		// The world renowned rplc8()!
		// ---------------------------------------
		(function() {

			// Replaces instances of "__key__" in string s,
			// with the values from corresponding key in data.
			let substitute = function( s, data ) {
				for( let key in data ) {
					let re = new RegExp( "__" + key + "__", "g" );
					s = s.replace( re, ""+(data[ key ]) );
				}
				return s;
			}

			// Injects data values into a single DOM element
			let inject = function( e, data ) {

				// Inject into the body of the element
				e.innerHTML = substitute( e.innerHTML, data );

				// Inject into the attributes of the actual tag of the element.
				// Do this slightly differently for IE because IE is stupid.
				let attrs = e.attributes;
				if( navigator.appName == "Microsoft Internet Explorer" ) {
					// XXX Do I still have to do this? Isn't IE dead yet?
					for( let k in attrs ) {
						let val = e.getAttribute( k );
						if( val ) {
							if( typeof val === "string" ) {
								if( val.match( /__/ ) ) {
									val = substitute( val, data );
									e.setAttribute( k, val );
								}
							}
						}
					}
				}
				else {
					for( let i = 0 ; i < attrs.length ; i++ ) {
						let attr = attrs[ i ];
						let val = attr.value;
						if( val ) {
							if( typeof val === "string" ) {
								if( val.match( /__/ ) ) {
									attr.value = substitute( val, data );
								}
							}
						}
					}
				}
			}

			// The main function
			M.rplc8 = function( elem, data, cb ) {

				// If elem isn't a DOM element, then it has to be query selector string
				if( ! ( elem instanceof HTMLElement ) ) {
					if( typeof elem !== "string" ) {
						throw new Error( "rplc8: invalid selector string" );
					}
					let coll = document.querySelectorAll( elem );
					if( coll.length !== 1 ) {
						throw new Error( "rplc8: selector \""+elem+"\" matches "+coll.length+" elements" );
					}
					elem = coll[ 0 ];
				}

				let sib = elem.nextSibling;		// Might be null.
				let mom = elem.parentNode;		// Almost certainly not null.
				let clones = [];

				mom.removeChild( elem );		// Take template out of the DOM.

				let validate_data = function( data ) {
					// Ensure that data is an array or object
					if( ! ( data instanceof Array ) ) {
						// If it's a single object, put it into an array.
						if( typeof data === "object" ) {
							data = [ data ];
						}
						else {
							data = [];
							//throw new Error( "rplc8: Replication is neither array nor object." );
						}
					}

					// Ensure that the first element in the array is an object.
					if( data.length > 0 && typeof data[ 0 ] !== "object" ) {
						throw new Error( "rplc8: Replication data array does not contain objects." );
					}

					return data;
				}

				let obj = { };

				let splice = function( index, remove_count, new_data, cb ) {

					if( index < 0 ) {
						index = clones.length + index;
					}
					if( index > clones.length) {
						index = clones.length;
					}

					let sib = clones[ index ] || null;

					if( index < clones.length ) {
						// remove the old clones
						let n = 0;
						while( n < remove_count && index < clones.length ) {
							let clone = clones.splice( index, 1 )[ 0 ];
							sib = clone.nextSibling;
							mom.removeChild( clone );
							n += 1;
						}
					}

					// insert new clones if data provided
					if( new_data ) {
						data = validate_data( new_data );
						let n = 0
						while( n < data.length ) {
							let d = data[ n ];						// Get data object from array.
							let clone = elem.cloneNode( true );		// Clone template element and
							inject( clone, d );						// inject the data.
							mom.insertBefore( clone, sib );			// Insert it into the DOM
							let i = index + n;
							clones.splice( i, 0, clone );	// insert clone into array
							if( cb ) {								// If call back function provided,
								// then call it with a refreshing function
								cb( clone, d, i, function( new_data, cb ) {
									splice( i, 1, new_data, cb );
								});	
							}
							n += 1;
						}
					}

					return obj;
				}

				let append = function( data, cb ) {
					return splice( clones.length, 0, data, cb );
				}

				let prepend = function( data, cb ) {
					return splice( 0, 0, data, cb );
				}

				let update = function( data, cb ) {
					return splice( 0, clones.length, data, cb );
				}

				let clear = function( index, count ) {
					return splice( index || 0, count || clones.length );
				}

				update( data, cb );

				obj.splice = splice;
				obj.append = append;
				obj.prepend = prepend;
				obj.update = update;
				obj.clear = clear;

				return obj;
			};

		})();


		// Lets you navigate through pseudo-pages within an actual page
		// without any actual document fetching from the server.
		M.Nav = function(data, new_show) {

			if(typeof data === "function") {
				new_show = data;
				data = null;
			}

			if(!data) {
				// no data object passed in use current query data 
				data = {};
				var a = document.location.search.split(/[?&]/);
				a.shift();
				a.forEach(function(kv) {
					var p = kv.split("=");
					data[p[0]] = (p.length > 1) ? decodeURIComponent(p[1]) : "";
				})
			}

			var state = { pageYOffset: 0, data: data };

			// build URL + query-string from current path and contents of 'data'
			var qs = "";
			for(var k in data) {
				qs += (qs ? "&" : "?") + k + "=" + encodeURIComponent(data[k]);
			}
			var url = document.location.pathname + qs;

			// if browser doesn't support pushstate, just redirect to the url
			if(history.pushState === undefined) {
				document.location = url;
				return;
			}

			if(!Nav.current_show) {
				// 1st time Nav() has been called

				// set current show func to a simple default 
				Nav.current_show = function(data) {
					if(data["page"] !== undefined) {
						// hide all elements with class "page" by setting css display to "none"
						var pages = document.getElementsByClassName('page')
						for(var i = 0; i < pages.length; i++ ) {
							pages[ i ].style.display = "none";
						}
						// jump to top of document
						document.body.scrollIntoView();
						// show the new page
						var p = document.getElementById( "page_"+data.page ).style.display = "inherit";
					}
				}

				if(history.replaceState !== undefined) {
					// set state for the current/initial location
					history.replaceState(state, "", url);
					// wire in the pop handler
					window.onpopstate = function(evt) {
						if(evt.state) {
							var data = evt.state;
							Nav.current_show(evt.state.data);
						}
					}
				}
			}
			else {
				// this is 2nd or later call to Nav()
				state.pageYOffset = window.pageYOffset;
				history.pushState(state, "", url);
			}

			// if new show func supplied, start using that one
			if(new_show) {
				Nav.current_show = new_show;
			}

			Nav.current_show(data);
		};


		// Ties a Javascript object to some user interface elements in the browser DOM.
		M.MXU = function( base, data ) {

			const form_types = "input select textarea".toUpperCase().split( " " );

			let named_element = function( name ) {
				return base.querySelector( "[name="+name+"]" );
			}
			
			let proxy = new Proxy( data, {

				get: function( tgt, prop ) {
					let e = named_element( prop );
					if( e ) {
						let v;
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								v = e.checked;
							}
							else {
								v = e.value;
							}
						}
						else {
							v = e.innerHTML;
						}
						tgt[ prop ] = v;
					}
					return tgt[ prop ];
				},

				set: function( tgt, prop, v ) {
					tgt[ prop ] = v;
					let e = named_element( prop );
					if( e ) {
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								e.checked = !! v;
							}
							else {
								e.value = v;
							}
						}
						else {
							e.innerHTML = v;
						}
					}
				},

			});

			for(let key in data ) {
				proxy[ key ] = data[ key ];
				let e = named_element( key );
				if( e && form_types.includes( e.tagName ) ) {
					e.onchange = evt => {
						proxy[ key ] = e.value;
					}
				}
			}

			return proxy;
		};


		// FDrop
		/*
		var dt = elem("droptarget");
		FDrop.attach(dt, function(files, evt) {
			files = files;
			var f = files[0];
			FDrop.mk_data_url(f, function(u) {
				dt.innerHTML = "<img height=100 src='"+u+"'><br>name="+f.name+"<br>type="+f.type+"<br>size="+f.size+"<p>data url:<p>"+u;
			});

		});
		*/
		(function() {

			let attach = function(element, cb) {

				let style = element.style
				let old_opacity = style.opacity

				element.ondragenter = function(evt) {
					style.opacity = "0.5";
				}
				element.ondragleave = function(evt) {
					if(evt.target === element)
						style.opacity = old_opacity;
				}

				// for drag/drop to work, element MUST have ondragover AND ondrop defined 
				element.ondragover = function(evt) {
					evt.preventDefault();			// required: ondragover MUST call this.
				}
				element.ondrop = function(evt) {
					evt.preventDefault();			// required
					style.opacity = old_opacity;	// because ondragleave not called on drop (chrome at least)
					let files = evt.dataTransfer.files
					cb(files, evt);
				}

			};

			let mk_data_url = function(f, cb) {
				let reader = new FileReader();
				reader.onload = function() {
					let data = reader.result;
					cb(data);
				};
				reader.readAsDataURL(f);
			};

			let put_file = function( file, url, okay, fail ) {
				let xhr = new XMLHttpRequest();
				xhr.onload = function() {
					okay( xhr );
				}
				xhr.upload.addEventListener("error", fail );
				xhr.open( "PUT", url, true );
				xhr.setRequestHeader( "Content-Type", file.type );
				xhr.send( file );
			};

			M.FDrop = {
				attach,
				mk_data_url,
				put_file,
			};
			
		})();


		// Load an image asyncrhonously, scale it to a specific width/height, convert
		// the image to a "data:" url, and return it via callback.
		M.scale_data_image = function( image_data_url, new_width, new_height, cb ) {
			let img = new Image();
			img.onload = function() {
				let cnv = document.createElement( "canvas" );
				cnv.width = new_width;
				cnv.height = new_height;
				var ctx = cnv.getContext("2d");
				ctx.drawImage(img, 0, 0, new_width, new_height);
				let new_data_url = cnv.toDataURL( "image/jpeg", 0.5 );
				cb( new_data_url );
			}
			img.src = image_data_url;
		};


		M.globalize = function(){};

	}


	// Tire of constantly calling this ... just globalizing everything
	let g = isBrowser ? window : global;
	for( let k in M ) {
		g[ k ] = M[ k ];
	}

	if(isNode) {
		module.exports = M;
	} else {
		window.sleepless = M;
	}


})();
/*!
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Create a global ID counter.
      self._counter = 1000;

      // Pool of unlocked HTML5 Audio objects.
      self._html5AudioPool = [];
      self.html5PoolSize = 10;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

      // Public properties.
      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null;

      // Set to false to disable the auto audio unlocker.
      self.autoUnlock = true;

      // Setup the various state values for global tracking.
      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // Don't update any of the nodes if we are muted.
        if (self._muted) {
          return self;
        }

        // When using Web Audio, we just need to adjust the master gain.
        if (self.usingWebAudio) {
          self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (self.usingWebAudio) {
        self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Handle stopping all sounds globally.
     */
    stop: function() {
      var self = this || Howler;

      // Loop through all Howls and stop them.
      for (var i=0; i<self._howls.length; i++) {
        self._howls[i].stop();
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
      var self = this || Howler;

      for (var i=self._howls.length-1; i>=0; i--) {
        self._howls[i].unload();
      }

      // Create a new AudioContext to make sure it is fully reset.
      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
      var self = this || Howler;

      // Keeps track of the suspend/resume state of the AudioContext.
      self.state = self.ctx ? self.ctx.state || 'suspended' : 'suspended';

      // Automatically begin the 30-second suspend process
      self._autoSuspend();

      // Check if audio is available.
      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio();

            // Check if the canplaythrough event is available.
            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch(e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      }

      // Test to make sure audio isn't disabled in Internet Explorer.
      try {
        var test = new Audio();
        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {}

      // Check for supported codecs.
      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = null;

      // Must wrap in a try/catch because IE11 in server mode throws an error.
      try {
        audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

      // Opera version <33 has mixed MP3 support, so we need to check for and block it.
      var ua = self._navigator ? self._navigator.userAgent : '';
      var checkOpera = ua.match(/OPR\/([0-6].)/g);
      var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);
      var checkSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1;
      var safariVersion = ua.match(/Version\/(.*?) /);
      var isOldSafari = (checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15);

      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!(audioTest.canPlayType('audio/wav; codecs="1"') || audioTest.canPlayType('audio/wav')).replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        m4b: !!(audioTest.canPlayType('audio/x-m4b;') || audioTest.canPlayType('audio/m4b;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        webm: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };

      return self;
    },

    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _unlockAudio: function() {
      var self = this || Howler;

      // Only run this if Web Audio is supported and it hasn't already been unlocked.
      if (self._audioUnlocked || !self.ctx) {
        return;
      }

      self._audioUnlocked = false;
      self.autoUnlock = false;

      // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      }

      // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.
      var unlock = function(e) {
        // Create a pool of unlocked HTML5 Audio objects that can
        // be used for playing sounds without user interaction. HTML5
        // Audio objects must be individually unlocked, as opposed
        // to the WebAudio API which only needs a single activation.
        // This must occur before WebAudio setup or the source.onended
        // event will not fire.
        while (self._html5AudioPool.length < self.html5PoolSize) {
          try {
            var audioNode = new Audio();

            // Mark this Audio object as unlocked to ensure it can get returned
            // to the unlocked pool when released.
            audioNode._unlocked = true;

            // Add the audio node to the pool.
            self._releaseHtml5Audio(audioNode);
          } catch (e) {
            self.noAudio = true;
            break;
          }
        }

        // Loop through any assigned audio nodes and unlock them.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and unlock the audio nodes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node && !sound._node._unlocked) {
                sound._node._unlocked = true;
                sound._node.load();
              }
            }
          }
        }

        // Fix Android can not play in suspend state.
        self._autoResume();

        // Create an empty buffer.
        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.
        if (typeof self.ctx.resume === 'function') {
          self.ctx.resume();
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function() {
          source.disconnect(0);

          // Update the unlocked state and prevent this check from happening again.
          self._audioUnlocked = true;

          // Remove the touch start listener.
          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('touchend', unlock, true);
          document.removeEventListener('click', unlock, true);
          document.removeEventListener('keydown', unlock, true);

          // Let all sounds know that audio has been unlocked.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('unlock');
          }
        };
      };

      // Setup a touch start listener to attempt an unlock in.
      document.addEventListener('touchstart', unlock, true);
      document.addEventListener('touchend', unlock, true);
      document.addEventListener('click', unlock, true);
      document.addEventListener('keydown', unlock, true);

      return self;
    },

    /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */
    _obtainHtml5Audio: function() {
      var self = this || Howler;

      // Return the next object from the pool if one exists.
      if (self._html5AudioPool.length) {
        return self._html5AudioPool.pop();
      }

      //.Check if the audio is locked and throw a warning.
      var testPlay = new Audio().play();
      if (testPlay && typeof Promise !== 'undefined' && (testPlay instanceof Promise || typeof testPlay.then === 'function')) {
        testPlay.catch(function() {
          console.warn('HTML5 Audio pool exhausted, returning potentially locked audio object.');
        });
      }

      return new Audio();
    },

    /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */
    _releaseHtml5Audio: function(audio) {
      var self = this || Howler;

      // Don't add audio to the pool if we don't know if it has been unlocked.
      if (audio._unlocked) {
        self._html5AudioPool.push(audio);
      }

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      // Check if any sounds are playing.
      for (var i=0; i<self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j=0; j<self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      }

      // If no sound has played after 30 seconds, suspend the context.
      self._suspendTimer = setTimeout(function() {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';

        // Handle updating the state of the audio context after suspending.
        var handleSuspension = function() {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;
            self._autoResume();
          }
        };

        // Either the state gets suspended or it is interrupted.
        // Either way, we need to update the state to suspended.
        self.ctx.suspend().then(handleSuspension, handleSuspension);
      }, 30000);

      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self.ctx.state !== 'interrupted' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended' || self.state === 'running' && self.ctx.state === 'interrupted') {
        self.ctx.resume().then(function() {
          self.state = 'running';

          // Emit to all Howls that the audio has resumed.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // If we don't have an AudioContext created yet, run the setup.
      if (!Howler.ctx) {
        setupAudioContext();
      }

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._format = (typeof o.format !== 'string') ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean' || o.preload === 'metadata') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;
      self._xhr = {
        method: o.xhr && o.xhr.method ? o.xhr.method : 'GET',
        headers: o.xhr && o.xhr.headers ? o.xhr.headers : null,
        withCredentials: o.xhr && o.xhr.withCredentials ? o.xhr.withCredentials : false,
      };

      // Setup all other default properties.
      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];
      self._playLock = false;

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfade = o.onfade ? [{fn: o.onfade}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onplayerror = o.onplayerror ? [{fn: o.onplayerror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];
      self._onstop = o.onstop ? [{fn: o.onstop}] : [];
      self._onmute = o.onmute ? [{fn: o.onmute}] : [];
      self._onvolume = o.onvolume ? [{fn: o.onvolume}] : [];
      self._onrate = o.onrate ? [{fn: o.onrate}] : [];
      self._onseek = o.onseek ? [{fn: o.onseek}] : [];
      self._onunlock = o.onunlock ? [{fn: o.onunlock}] : [];
      self._onresume = [];

      // Web Audio or HTML5 Audio?
      self._webAudio = Howler.usingWebAudio && !self._html5;

      // Automatically try to enable audio.
      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.autoUnlock) {
        Howler._unlockAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // If they selected autoplay, add a play event to the load queue.
      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play();
          }
        });
      }

      // Load the source file unless otherwise specified.
      if (self._preload && self._preload !== 'none') {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];
          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
            continue;
          }

          // Extract the file extension from the URL or base64 data URI.
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Log a warning if no extension was found.
        if (!ext) {
          console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
        }

        // Check if this extension is available.
        if (ext && Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');
        return;
      }

      self._src = url;
      self._state = 'loading';

      // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.
      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      }

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended.
        // If there is, play that sound. If not, continue as usual.
        if (!self._playLock) {
          var num = 0;
          for (var i=0; i<self._sounds.length; i++) {
            if (self._sounds[i]._paused && !self._sounds[i]._ended) {
              num++;
              id = self._sounds[i]._id;
            }
          }

          if (num === 1) {
            sprite = null;
          } else {
            id = null;
          }
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // Select the sprite definition.
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If the sound hasn't loaded, we must wait to get the audio's duration.
      // We also need to wait to make sure we don't run into race conditions with
      // the order of function calls.
      if (self._state !== 'loaded') {
        // Set the sprite value on this sound.
        sound._sprite = sprite;

        // Mark this sound as not ended in case another sound is played before this one loads.
        sound._ended = false;

        // Add the sound to the queue to be played on load.
        var soundId = sound._id;
        self._queue.push({
          event: 'play',
          action: function() {
            self.play(soundId);
          }
        });

        return soundId;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          self._loadQueue('play');
        }

        return sound._id;
      }

      // Make sure the AudioContext isn't suspended, and resume it if it is.
      if (self._webAudio) {
        Howler._autoResume();
      }

      // Determine how long to play for and where to start playing.
      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
      var timeout = (duration * 1000) / Math.abs(sound._rate);
      var start = self._sprite[sprite][0] / 1000;
      var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      sound._sprite = sprite;

      // Mark the sound as ended instantly so that this async playback
      // doesn't get grabbed by another call to play while this one waits to start.
      sound._ended = false;

      // Update the parameters of the sound.
      var setParams = function() {
        sound._paused = false;
        sound._seek = seek;
        sound._start = start;
        sound._stop = stop;
        sound._loop = !!(sound._loop || self._sprite[sprite][2]);
      };

      // End the sound instantly if seek is at the end.
      if (seek >= stop) {
        self._ended(sound);
        return;
      }

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._playLock = false;
          setParams();
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function() {
              self._emit('play', sound._id);
              self._loadQueue();
            }, 0);
          }
        };

        if (Howler.state === 'running' && Howler.ctx.state !== 'interrupted') {
          playWebAudio();
        } else {
          self._playLock = true;

          // Wait for the audio context to resume before playing.
          self.once('resume', playWebAudio);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate;

          // Some browsers will throw an error if this is called without user interaction.
          try {
            var play = node.play();

            // Support older browsers that don't support promises, and thus don't have this issue.
            if (play && typeof Promise !== 'undefined' && (play instanceof Promise || typeof play.then === 'function')) {
              // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
              self._playLock = true;

              // Set param values immediately.
              setParams();

              // Releases the lock and executes queued actions.
              play
                .then(function() {
                  self._playLock = false;
                  node._unlocked = true;
                  if (!internal) {
                    self._emit('play', sound._id);
                  } else {
                    self._loadQueue();
                  }
                })
                .catch(function() {
                  self._playLock = false;
                  self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                    'on mobile devices and Chrome where playback was not within a user interaction.');

                  // Reset the ended and paused values.
                  sound._ended = true;
                  sound._paused = true;
                });
            } else if (!internal) {
              self._playLock = false;
              setParams();
              self._emit('play', sound._id);
            }

            // Setting rate before playing won't work in IE, so we set it again here.
            node.playbackRate = sound._rate;

            // If the node is still paused, then we can assume there was a playback issue.
            if (node.paused) {
              self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                'on mobile devices and Chrome where playback was not within a user interaction.');
              return;
            }

            // Setup the end timer on sprites or listen for the ended event.
            if (sprite !== '__default' || sound._loop) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            } else {
              self._endTimers[sound._id] = function() {
                // Fire ended on this audio node.
                self._ended(sound);

                // Clear this listener.
                node.removeEventListener('ended', self._endTimers[sound._id], false);
              };
              node.addEventListener('ended', self._endTimers[sound._id], false);
            }
          } catch (err) {
            self._emit('playerror', sound._id, err);
          }
        };

        // If this is streaming audio, make sure the src is set and load again.
        if (node.src === 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA') {
          node.src = self._src;
          node.load();
        }

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        var loadedNoReadyState = (window && window.ejecta) || (!node.readyState && Howler._navigator.isCocoonJS);
        if (node.readyState >= 3 || loadedNoReadyState) {
          playHtml5();
        } else {
          self._playLock = true;
          self._state = 'loading';

          var listener = function() {
            self._state = 'loaded';
            
            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };
          node.addEventListener(Howler._canPlayEvent, listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'pause',
          action: function() {
            self.pause(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound has been created.
              if (!sound._node.bufferSource) {
                continue;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        }

        // Fire the pause event, unless `true` is passed as the 2nd argument.
        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to stop when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'stop',
          action: function() {
            self.stop(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound's AudioBufferSourceNode has been created.
              if (sound._node.bufferSource) {
                if (typeof sound._node.bufferSource.stop === 'undefined') {
                  sound._node.bufferSource.noteOff(0);
                } else {
                  sound._node.bufferSource.stop(0);
                }

                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
              }
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;
              sound._node.pause();

              // If this is a live stream, stop download once the audio is stopped.
              if (sound._node.duration === Infinity) {
                self._clearSound(sound._node);
              }
            }
          }

          if (!internal) {
            self._emit('stop', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to mute when capable.
      if (self._state !== 'loaded'|| self._playLock) {
        self._queue.push({
          event: 'mute',
          action: function() {
            self.mute(muted, id);
          }
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          // Cancel active fade and set the volume to the end value.
          if (sound._interval) {
            self._stopFade(sound._id);
          }

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded'|| self._playLock) {
          self._queue.push({
            event: 'volume',
            action: function() {
              self.volume.apply(self, args);
            }
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            // Stop currently running fades.
            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to fade when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'fade',
          action: function() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      }

      // Make sure the to/from/len values are numbers.
      from = Math.min(Math.max(0, parseFloat(from)), 1);
      to = Math.min(Math.max(0, parseFloat(to)), 1);
      len = parseFloat(len);

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          }

          // If we are using Web Audio, let the native methods do the actual fade.
          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          self._startFadeInterval(sound, from, to, len, ids[i], typeof id === 'undefined');
        }
      }

      return self;
    },

    /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */
    _startFadeInterval: function(sound, from, to, len, id, isGroup) {
      var self = this;
      var vol = from;
      var diff = to - from;
      var steps = Math.abs(diff / 0.01);
      var stepLen = Math.max(4, (steps > 0) ? len / steps : len);
      var lastTick = Date.now();

      // Store the value being faded to.
      sound._fadeTo = to;

      // Update the volume value on each interval tick.
      sound._interval = setInterval(function() {
        // Update the volume based on the time since the last tick.
        var tick = (Date.now() - lastTick) / len;
        lastTick = Date.now();
        vol += diff * tick;

        // Round to within 2 decimal points.
        vol = Math.round(vol * 100) / 100;

        // Make sure the volume is in the right bounds.
        if (diff < 0) {
          vol = Math.max(to, vol);
        } else {
          vol = Math.min(to, vol);
        }

        // Change the volume.
        if (self._webAudio) {
          sound._volume = vol;
        } else {
          self.volume(vol, sound._id, true);
        }

        // Set the group's volume.
        if (isGroup) {
          self._volume = vol;
        }

        // When the fade is complete, stop it and fire event.
        if ((to < from && vol <= to) || (to > from && vol >= to)) {
          clearInterval(sound._interval);
          sound._interval = null;
          sound._fadeTo = null;
          self.volume(to, sound._id);
          self._emit('fade', sound._id);
        }
      }, stepLen);
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
      var self = this;
      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self.volume(sound._fadeTo, id);
        sound._fadeTo = null;
        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;
            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;

              // If playing, restart playback to ensure looping updates.
              if (self.playing(ids[i])) {
                self.pause(ids[i], true);
                self.play(ids[i], true);
              }
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
      var self = this;
      var args = arguments;
      var rate, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the playback rate or return the current value.
      var sound;
      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'rate',
            action: function() {
              self.rate.apply(self, args);
            }
          });

          return self;
        }

        // Set the group rate.
        if (typeof id === 'undefined') {
          self._rate = rate;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            if (self.playing(id[i])) {
              sound._rateSeek = self.seek(id[i]);
              sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            }
            sound._rate = rate;

            // Change the playback rate.
            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            }

            // Reset the timers.
            var seek = self.seek(id[i]);
            var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
            var timeout = (duration * 1000) / Math.abs(sound._rate);

            // Start a new end timer if sound is already playing.
            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);
              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        if (self._sounds.length) {
          id = self._sounds[0]._id;
        }
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else if (self._sounds.length) {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return 0;
      }

      // If the sound hasn't loaded, add it to the load queue to seek when capable.
      if (typeof seek === 'number' && (self._state !== 'loaded' || self._playLock)) {
        self._queue.push({
          event: 'seek',
          action: function() {
            self.seek.apply(self, args);
          }
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          sound._ended = false;
          self._clearTimer(id);

          // Update the seek position for HTML5 Audio.
          if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
            sound._node.currentTime = seek;
          }

          // Seek and emit when ready.
          var seekAndEmit = function() {
            // Restart the playback if the sound was playing.
            if (playing) {
              self.play(id, true);
            }

            self._emit('seek', id);
          };

          // Wait for the play lock to be unset before emitting (HTML5 Audio).
          if (playing && !self._webAudio) {
            var emitSeek = function() {
              if (!self._playLock) {
                seekAndEmit();
              } else {
                setTimeout(emitSeek, 0);
              }
            };
            setTimeout(emitSeek, 0);
          } else {
            seekAndEmit();
          }
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
      var self = this;

      // Check the passed sound ID (if any).
      if (typeof id === 'number') {
        var sound = self._soundById(id);
        return sound ? !sound._paused : false;
      }

      // Otherwise, loop through all sounds and check if any are playing.
      for (var i=0; i<self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
      var self = this;
      var duration = self._duration;

      // If we pass an ID, get the sound and return the sprite length.
      var sound = self._soundById(id);
      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading (except in IE).
          self._clearSound(sounds[i]._node);

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
          sounds[i]._node.removeEventListener('ended', sounds[i]._endFn, false);

          // Release the Audio object back to the pool.
          Howler._releaseHtml5Audio(sounds[i]._node);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);
      }

      // Remove the references in the global Howler object.
      var index = Howler._howls.indexOf(self);
      if (index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // Delete this sound from the cache (if no other Howl is using it).
      var remCache = true;
      for (i=0; i<Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      }

      // Clear global errors.
      Howler.noAudio = false;

      // Clear out `self`.
      self._state = 'unloaded';
      self._sounds = [];
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {id: id, fn: fn, once: once} : {id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0;

      // Allow passing just an event and ID.
      if (typeof fn === 'number') {
        id = fn;
        fn = null;
      }

      if (fn || id) {
        // Loop through event store and remove the passed function.
        for (i=0; i<events.length; i++) {
          var isId = (id === events[i].id);
          if (fn === events[i].fn && isId || !fn && isId) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);
        for (i=0; i<keys.length; i++) {
          if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Setup the event listener.
      self.on(event, fn, id, 1);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];

      // Loop through event store and fire all functions.
      for (var i=events.length-1; i>=0; i--) {
        // Only fire the listener if the correct ID is used.
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);

          // If this event was setup with `once`, remove it.
          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      }

      // Pass the event type into load queue so that it can continue stepping.
      self._loadQueue(event);

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function(event) {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0];

        // Remove this task if a matching event was passed.
        if (task.event === event) {
          self._queue.shift();
          self._loadQueue();
        }

        // Run the task if no event type is passed.
        if (!event) {
          task.action();
        }
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
      var self = this;
      var sprite = sound._sprite;

      // If we are using IE and there was network latency we may be clipping
      // audio before it completes playing. Lets check the node to make sure it
      // believes it has completed, before ending the playback.
      if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
        setTimeout(self._ended.bind(self, sound), 100);
        return self;
      }

      // Should this sound loop?
      var loop = !!(sound._loop || self._sprite[sprite][2]);

      // Fire the ended event.
      self._emit('end', sound._id);

      // Restart the playback for HTML5 Audio loop.
      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      }

      // Restart this timer if on a Web Audio loop.
      if (self._webAudio && loop) {
        self._emit('play', sound._id);
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;

        var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      }

      // Mark the node as paused.
      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        self._clearTimer(sound._id);

        // Clean up the buffer source.
        self._cleanBuffer(sound._node);

        // Attempt to auto-suspend AudioContext if no sounds are still playing.
        Howler._autoSuspend();
      }

      // When using a sprite, end the track.
      if (!self._webAudio && !loop) {
        self.stop(sound._id, true);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        // Clear the timeout or remove the ended listener.
        if (typeof self._endTimers[id] !== 'function') {
          clearTimeout(self._endTimers[id]);
        } else {
          var sound = self._soundById(id);
          if (sound && sound._node) {
            sound._node.removeEventListener('ended', self._endTimers[id], false);
          }
        }

        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop || 0;
      }
      sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
      var self = this;
      var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf('Apple') >= 0;

      if (Howler._scratchBuffer && node.bufferSource) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);
        if (isIOS) {
          try { node.bufferSource.buffer = Howler._scratchBuffer; } catch(e) {}
        }
      }
      node.bufferSource = null;

      return self;
    },

    /**
     * Set the source to a 0-second silence to stop any downloading (except in IE).
     * @param  {Object} node Audio node to clear.
     */
    _clearSound: function(node) {
      var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);
      if (!checkIE) {
        node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a unique ID for this sound.
      self._id = ++Howler._counter;

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
        self._node.paused = true;
        self._node.connect(Howler.masterGain);
      } else if (!Howler.noAudio) {
        // Get an unlocked Audio object from the pool.
        self._node = Howler._obtainHtml5Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

        // Listen for the 'ended' event on the sound to account for edge-case where
        // a finite sound has a duration of Infinity.
        self._endFn = self._endListener.bind(self);
        self._node.addEventListener('ended', self._endFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = parent._preload === true ? 'auto' : parent._preload;
        self._node.volume = volume * Howler.volume();

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = ++Howler._counter;

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

      // Clear the event listener.
      self._node.removeEventListener('error', self._errorFn, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';
        parent._emit('load');
        parent._loadQueue();
      }

      // Clear the event listener.
      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    },

    /**
     * HTML5 Audio ended listener callback.
     */
    _endListener: function() {
      var self = this;
      var parent = self._parent;

      // Only handle the `ended`` event if the duration is Infinity.
      if (parent._duration === Infinity) {
        // Update the parent duration to match the real audio duration.
        // Round up the duration to account for the lower precision in HTML5 Audio.
        parent._duration = Math.ceil(self._node.duration * 10) / 10;

        // Update the sprite that corresponds to the real duration.
        if (parent._sprite.__default[1] === Infinity) {
          parent._sprite.__default[1] = parent._duration * 1000;
        }

        // Run the regular ended method.
        parent._ended(self);
      }

      // Clear the event listener since the duration is now correct.
      self._node.removeEventListener('ended', self._endFn, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  var cache = {};

  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */
  var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration;

      // Load the sound into this Howl.
      loadSound(self);

      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);
      for (var i=0; i<data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open(self._xhr.method, url, true);
      xhr.withCredentials = self._xhr.withCredentials;
      xhr.responseType = 'arraybuffer';

      // Apply any custom headers to the request.
      if (self._xhr.headers) {
        Object.keys(self._xhr.headers).forEach(function(key) {
          xhr.setRequestHeader(key, self._xhr.headers[key]);
        });
      }

      xhr.onload = function() {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];
        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
          return;
        }

        decodeAudioData(xhr.response, self);
      };
      xhr.onerror = function() {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };
      safeXhrSend(xhr);
    }
  };

  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */
  var safeXhrSend = function(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };

  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */
  var decodeAudioData = function(arraybuffer, self) {
    // Fire a load error if something broke.
    var error = function() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    };

    // Load the sound on success.
    var success = function(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      } else {
        error();
      }
    };

    // Decode the buffer into an audio source.
    if (typeof Promise !== 'undefined' && Howler.ctx.decodeAudioData.length === 1) {
      Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      Howler.ctx.decodeAudioData(arraybuffer, success, error);
    }
  }

  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */
  var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {__default: [0, self._duration * 1000]};
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
      self._state = 'loaded';
      self._emit('load');
      self._loadQueue();
    }
  };

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  var setupAudioContext = function() {
    // If we have already detected that Web Audio isn't supported, don't run this step again.
    if (!Howler.usingWebAudio) {
      return;
    }

    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch(e) {
      Howler.usingWebAudio = false;
    }

    // If the audio context creation still failed, set using web audio to false.
    if (!Howler.ctx) {
      Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
      if (Howler._navigator && !safari) {
        Howler.usingWebAudio = false;
      }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
      Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : Howler._volume, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
  };

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  // Add support for CommonJS libraries such as browserify.
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Add to global in Node.js (for testing, etc).
  if (typeof global !== 'undefined') {
    global.HowlerGlobal = HowlerGlobal;
    global.Howler = Howler;
    global.Howl = Howl;
    global.Sound = Sound;
  } else if (typeof window !== 'undefined') {  // Define globally in case AMD is not available or unused.
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  }
})();


/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  // Setup default properties.
  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */
  HowlerGlobal.prototype.stereo = function(pan) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Loop through all Howls and update their stereo panning.
    for (var i=self._howls.length-1; i>=0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };

  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */
  HowlerGlobal.prototype.pos = function(x, y, z) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._pos[1] : y;
    z = (typeof z !== 'number') ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];

      if (typeof self.ctx.listener.positionX !== 'undefined') {
        self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
      }
    } else {
      return self._pos;
    }

    return self;
  };

  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */
  HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    var or = self._orientation;
    y = (typeof y !== 'number') ? or[1] : y;
    z = (typeof z !== 'number') ? or[2] : z;
    xUp = (typeof xUp !== 'number') ? or[3] : xUp;
    yUp = (typeof yUp !== 'number') ? or[4] : yUp;
    zUp = (typeof zUp !== 'number') ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];

      if (typeof self.ctx.listener.forwardX !== 'undefined') {
        self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upX.setTargetAtTime(xUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upY.setTargetAtTime(yUp, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upZ.setTargetAtTime(zUp, Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
      }
    } else {
      return or;
    }

    return self;
  };

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */
  Howl.prototype.init = (function(_super) {
    return function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      };

      // Setup event listeners.
      self._onstereo = o.onstereo ? [{fn: o.onstereo}] : [];
      self._onpos = o.onpos ? [{fn: o.onpos}] : [];
      self._onorientation = o.onorientation ? [{fn: o.onorientation}] : [];

      // Complete initilization with howler.js core's init function.
      return _super.call(this, o);
    };
  })(Howl.prototype.init);

  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */
  Howl.prototype.stereo = function(pan, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function() {
          self.stereo(pan, id);
        }
      });

      return self;
    }

    // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
    var pannerType = (typeof Howler.ctx.createStereoPanner === 'undefined') ? 'spatial' : 'stereo';

    // Setup the group's stereo panning if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    }

    // Change the streo panning of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower';

            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              if (typeof sound._panner.positionX !== 'undefined') {
                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
              } else {
                sound._panner.setPosition(pan, 0, 0);
              }
            } else {
              sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */
  Howl.prototype.pos = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change position when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? 0 : y;
    z = (typeof z !== 'number') ? -0.5 : z;

    // Setup the group's spatial position if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    }

    // Change the spatial position of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.positionX !== 'undefined') {
              sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setPosition(x, y, z);
            }
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */
  Howl.prototype.orientation = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._orientation[1] : y;
    z = (typeof z !== 'number') ? self._orientation[2] : z;

    // Setup the group's spatial orientation if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    }

    // Change the spatial orientation of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.orientationX !== 'undefined') {
              sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setOrientation(x, y, z);
            }
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */
  Howl.prototype.pannerAttr = function() {
    var self = this;
    var args = arguments;
    var o, id, sound;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // Determine the values based on arguments.
    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (typeof args[0] === 'object') {
        o = args[0];

        // Set the grou's panner attribute values.
        if (typeof id === 'undefined') {
          if (!o.pannerAttr) {
            o.pannerAttr = {
              coneInnerAngle: o.coneInnerAngle,
              coneOuterAngle: o.coneOuterAngle,
              coneOuterGain: o.coneOuterGain,
              distanceModel: o.distanceModel,
              maxDistance: o.maxDistance,
              refDistance: o.refDistance,
              rolloffFactor: o.rolloffFactor,
              panningModel: o.panningModel
            };
          }

          self._pannerAttr = {
            coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== 'undefined' ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== 'undefined' ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.pannerAttr.coneOuterGain !== 'undefined' ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.pannerAttr.distanceModel !== 'undefined' ? o.pannerAttr.distanceModel : self._distanceModel,
            maxDistance: typeof o.pannerAttr.maxDistance !== 'undefined' ? o.pannerAttr.maxDistance : self._maxDistance,
            refDistance: typeof o.pannerAttr.refDistance !== 'undefined' ? o.pannerAttr.refDistance : self._refDistance,
            rolloffFactor: typeof o.pannerAttr.rolloffFactor !== 'undefined' ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
            panningModel: typeof o.pannerAttr.panningModel !== 'undefined' ? o.pannerAttr.panningModel : self._panningModel
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    }

    // Update the values of the specified sounds.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel
        };

        // Update the panner values or create a new panner if none exists.
        var panner = sound._panner;
        if (panner) {
          panner.coneInnerAngle = pa.coneInnerAngle;
          panner.coneOuterAngle = pa.coneOuterAngle;
          panner.coneOuterGain = pa.coneOuterGain;
          panner.distanceModel = pa.distanceModel;
          panner.maxDistance = pa.maxDistance;
          panner.refDistance = pa.refDistance;
          panner.rolloffFactor = pa.rolloffFactor;
          panner.panningModel = pa.panningModel;
        } else {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          }

          // Create a new panner node.
          setupPanner(sound, 'spatial');
        }
      }
    }

    return self;
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */
  Sound.prototype.init = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Setup user-defined default properties.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete initilization with howler.js core Sound's init function.
      _super.call(this);

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  })(Sound.prototype.init);

  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */
  Sound.prototype.reset = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Reset all spatial plugin properties on this sound.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      } else if (self._panner) {
        // Disconnect the panner.
        self._panner.disconnect(0);
        self._panner = undefined;
        parent._refreshBuffer(self);
      }

      // Complete resetting of the sound.
      return _super.call(this);
    };
  })(Sound.prototype.reset);

  /** Helper Methods **/
  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */
  var setupPanner = function(sound, type) {
    type = type || 'spatial';

    // Create the new panner node.
    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.panningModel = sound._pannerAttr.panningModel;

      if (typeof sound._panner.positionX !== 'undefined') {
        sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
        sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
        sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      }

      if (typeof sound._panner.orientationX !== 'undefined') {
        sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
        sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
        sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
      }
    } else {
      sound._panner = Howler.ctx.createStereoPanner();
      sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
    }

    sound._panner.connect(sound._node);

    // Update the connections.
    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id, true);
    }
  };
})();

/*
	
Squids

An HTML5 canvas-based game engine and a state of mind.

This code intentionally makes a lot of globals.
Like 'em or shut up.

Copyright 2022  Sleepless Software Inc.  All Rights Reserved

See the LICENSE.txt file included with the Squids source code for 
licensing information

*/

( function() {

	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// vars and constants, etc.
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	const NOP = function(){};	// A do-nothing function

	const doc = document;
	const body = doc.body;

	const DBG_FONT_SIZE = 17;
	const DBG_LINE_HEIGHT = DBG_FONT_SIZE + ( DBG_FONT_SIZE * 0.1 );
	const DBG_SHADOW_OFFSET = DBG_FONT_SIZE * 0.1;
	let dbg_font = null;
	let dbg_font_shadow = null;
	dbg_msgs = [];
	debug = false;

	// make a bunch commonly useful things global for convenience
	rand = Math.random;
	round = Math.round;
	min = Math.min;
	max = Math.max;
	sqrt = Math.sqrt
	sin = Math.sin
	cos = Math.cos
	floor = Math.floor
	abs = Math.abs
	atan2 = Math.atan2
	PI = Math.PI
	PI2 = PI * 2
	PIH = PI / 2

	// change 1.6666666666666 to "1.67" (useful for debugging output)
	rndhun = n => ( round( n * 100 ) / 100 );

	// return a random integer from 0 thru n - 1
	roll = function( n ) { return toInt( rand() * n ); }


	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// global mouse position values that can be consulted any time
	mouse_x = 0;
	mouse_y = 0;

	// global key up/down status
	// e.g., if( keys[ 'p' ] ) { the "p" key is down }
	keys = [];


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// utility stuff
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	let seq_num = 0;

	// return an every increasing integer
	const seq = function() {
		seq_num += 1;
		return seq_num;
	}


	const asset_cache = {}

	load_image = function(path, okay = NOP, fail = NOP) {
		let _cache = asset_cache;
		let img = _cache[path];
		if(img) {
			okay(img);
		} else {
			let e = doc.createElement( "img" );
			e.src = path;
			e.style.display = "none";
			e.onload = function() {
				let img = {
					w: e.width,
					h: e.height,
					data: e,
					smoothing: true,
				};
				img.size = function() {
					return vec( img.w, img.h );
				};
				img.make_radius = function() {
					let sz = img.size();	// get image w, h
					return ( ( sz.x + sz.y ) / 2 ) * 0.5;	// half of average of w and h
				};
				_cache[ path ] = img;
				okay(img);
			};
			e.onerror = function(err) {
				fail(err);
			};
			body.appendChild(e);
		}
	};


	load_sound = function(path, okay = NOP, fail = NOP) {
		let _cache = asset_cache;
		let snd = new Howl({
			src: [ path ], 
			onload: () => {
				_cache[ path ] = snd;
				okay( snd );
			},
			onloaderror: err => {
				fail( err );
			},
		});
	};


	// return a fontish thing that you can pass back into draw_text()
	// sprite-fonts can be in a module
	load_font = function( face, sz, clr ) {
		let font = { height: sz, face: face, style: "" + sz + "px " + face, color: clr };
		return font;
	};


	load_assets = function(img_paths, snd_paths, prog = NOP, err = NOP) {

		let total = img_paths.length + snd_paths.length;

		let done =  0;

		let rp = runp();
		for( let path of img_paths ) {
			rp.add( fin => {
				load_image( path, img => {
					done += 1;
					prog( done / total, path, img, 'image' );
					fin();
				}, e => {
					err( "Error loading image: "+path );
				}); 
			} );
		}

		for( let path of snd_paths ) {
			rp.add( fin => {
				load_sound( path, snd => {
					done += 1;
					prog( done / total, path, snd, 'sound' );
					fin();
				}, e => {
					err( "Error loading sound: "+path );
				}); 
			} );
		}

		rp.run( NOP );	// load 'em up, cowboy

	};

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// Canvas related stuff

	// make the canvas object and attach it to document body
	canvas = doc.getElementById("SquidsCanvas");
	if(!canvas)
	{
		canvas = doc.createElement("canvas");
		canvas.id = "SquidsCanvas";
		canvas.style.position = "absolute";
		canvas.style.left = "0";
		canvas.style.top = "0";
		canvas.style.width = "100vw";
		canvas.style.height = "100vh";
		canvas.style.backgroundColor = "black";
		body.appendChild(canvas);
	}

	const ctx = canvas.getContext("2d");
	//ctx.imageSmoothingEnabled = false;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	// draw text str at a given pos, in a given font,
	// with a given alignment and opacity
	// TODO add rotation?
	draw_text = function( str, x, y, font, align, opa ) {
		ctx.save();
		ctx.font = font.style;
		ctx.fillStyle = font.color;
		ctx.textBaseline = 'middle';
		ctx.textAlign = align || 'center';
		ctx.globalAlpha = opa; // XXX opacity
		ctx.fillText( str, x, y );
		let w = ctx.measureText( str ).width;
		ctx.restore();
		return w;
	}

	// TODO add opacity and rotation?
	fill_rect = function( x, y, w, h, clr) {
		ctx.save();
		ctx.fillStyle = clr;
		ctx.fillRect( x, y, w, h);
		ctx.restore();
	};

	// TODO add opacity and rotation?
	draw_line = function( x1 = 0, y1 = 0, x2 = 10, y2 = 10, clr = "#777" ) {
		ctx.save();
		ctx.strokeStyle = clr;
		ctx.beginPath();
		ctx.moveTo( x1, y1 );
		ctx.lineTo( x2, y2 );
		ctx.stroke();
		ctx.restore();
	}

	// TODO add opacity and rotation?
	draw_rect = function( dx = 0, dy = 0, dw = 10, dh = 10, clr = "#777" ) {
		ctx.save();
		ctx.strokeStyle = clr;
		ctx.strokeRect(dx, dy, dw, dh);
		ctx.restore();
	}

	// TODO add opacity and rotation?
	draw_circle = function( dx = 0, dy = 0, r = 10, clr = "#777" ) {
		ctx.save();
		ctx.strokeStyle = clr;
		ctx.beginPath();
		ctx.ellipse( dx, dy, r, r, 0, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.restore();
	}

	// draw a crosshair at dx, dy
	// TODO add opacity and rotation?
	draw_cross = function( dx = 0 , dy = 0 , sz = 25 , clr = "#777" ) {
		ctx.save();
		ctx.strokeStyle = clr;
		ctx.beginPath();
		ctx.moveTo( dx - sz, dy );
		ctx.lineTo( dx + sz, dy );
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo( dx, dy - sz );
		ctx.lineTo( dx, dy + sz );
		ctx.stroke();
		ctx.restore();
	}

	// Draw image onto canvas at dx,dy, with opacity, rotation, and scaling
	// dx,dy = destination x,y
	// opa = opacity (gangnam style)
	// rot = rotation angle
	// px,py = x,y of pivot point for rotation image top-left corner
	// sclx,scly = scaling factor 1.0 = normal size
	// sx,sy = x,y offset into img of top left corner of sub-rectangle
	// sw,sh = sw,sh width and height of subrectangle
	draw_image = function( img, dx = 0, dy = 0, opa = 1, rot = 0, px = img.w * 0.5, py = img.h * 0.5, sclx = 1, scly = 1, sx = 0, sy = 0, sw = img.w, sh = img.h ) {

		ctx.save();
		ctx.imageSmoothingEnabled = img.smoothing;
		ctx.globalAlpha = opa;

		let dw = sw * sclx;
		let dh = sh * scly;

		if(rot == 0) {
			ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh );
		} else {
			ctx.translate(dx + px, dy + py);
			ctx.rotate(rot);
			ctx.translate(-(dx + px), -(dy + py));
			ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
		}

		if(debug) {
			// draw box around image
			draw_rect( dx, dy, dw, dh, "#00f" );
			// draw crosshair at dx, dy
			draw_cross(dx, dy, 8, "#f00");
		}

		ctx.restore();
	};

	// Draw a sub-rectangle of img to the canvas
	// sx,sy = x,y offset into img of top left corner of sub-rectangle
	// sw,sh = sw,sh width and height of subrectangle
	// dx,dh = destination x,y in canvas to draw the sub-rectangle
	// opa = opacity (gangnam style)
	// rot = rotation angle
	// px,py = x,y of pivot point for rotation image top-left corner
	// sclx,scly = scaling factor 1.0 = normal size
	/*
	draw_image_tile = function( img, sx = 0, sy = 0, sw = img.w, sh = img.h, dx = 0, dy = 0, opa = 1, rot = 0, px = img.w * 0.5, py = img.h * 0.5, sclx = 1, scly = 1 ) {
		ctx.save();
		ctx.imageSmoothingEnabled = false;
		ctx.globalAlpha = opa;

		let dw = img.w * sclx;
		let dh = img.h * scly;

		if(rot == 0) {
			ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
		} else {
			ctx.translate(dx + px, dy + py);
			ctx.rotate(rot);
			ctx.translate(-(dx + px), -(dy + py));
			ctx.drawImage(img.data, 0, 0, img.w, img.h, dx, dy, dw, dh);
		}

		if(debug) {
			// draw box around image
			draw_rect( dx, dy, dw, dh, "#00f" );
			// draw crosshair at dx, dy
			draw_cross(dx, dy, 8, "#f00");
		}

		ctx.restore();
	};
	*/


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Things
	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Listening for and dispatching events requires a Thing.
	// Events need to know about Things because listeners are
	// tracked using the unique id of the thing.
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// Set up event handlers and dispatching function.
	// when events occur on canvas, they'll be distributed to
	// any things that have called listen() for that even type.
	// x, y values are relative to canvas top left.

	const listeners = {};

	// dispatch an event type to any things that have listened for that type.
	// returns # of listeners that event was sent to.
	event_dispatch = function( type /* other args */) {
		let args = Array.prototype.slice.call(arguments); // get args as array
		args.shift();				// discard the first arg (type)
		let l = listeners[type];	// get hash of listeners
		if( ! l )
			return [];			// no listeners
		let objs = Object.values( l );
		for( let o of objs ) {	// walk through listeners ...
			let t = o.t;		// get Thing reference
			let f = o.f;		// get listener func
			f.apply(t, args);	// call listener func
		}
		return objs;
	}

	// install DOM event listeners

	body.onresize = function(evt) {
		event_dispatch("resize", vec(window.innerWidth, window.innerHeight), evt);
	}

	canvas.onmousedown = function(evt) {
		mouse_x = evt.clientX - canvas.offsetLeft;
		mouse_y = evt.clientY - canvas.offsetTop;
		event_dispatch("mousedown", mouse_x, mouse_y, evt);
	};

	canvas.onmouseup = function(evt) {
		mouse_x = evt.clientX - canvas.offsetLeft;
		mouse_y = evt.clientY - canvas.offsetTop;
		event_dispatch("mouseup", mouse_x, mouse_y, evt);
	};

	body.onmousemove = function(evt) {
		mouse_x = evt.clientX - canvas.offsetLeft;
		mouse_y = evt.clientY - canvas.offsetTop;
		event_dispatch("mousemove", mouse_x, mouse_y, evt);
	};

	body.onkeyup = function(evt) {

		let k = evt.key;
		if(k === " ")
		{
			k = "space";
		}

		keys[ k ] = false;
		event_dispatch("keyup", k, evt);
	}

	body.onkeydown = function(evt) {

		let k = evt.key;
		if(k === " ")
		{
			k = "space";
		}

		keys[ k ] = true;
		if( k === "`" && evt.ctrlKey ) {
			debug = ! debug;
		}
		event_dispatch("keydown", k, evt);
	}

	body.onblur = function(evt) {
		event_dispatch("blur", evt);
	}

	body.onfocus = function(evt) {
		event_dispatch("focus", evt);
	}

	// the Thing constructor
	Thing = function( self = {} ) {

		self.id = seq();	// create unique id for this squid

		self.listen = function( evt_type, cb = NOP ) {
			let self = this;
			if( listeners[ evt_type ] === undefined ) {
				listeners[ evt_type ] = {};
			}
			listeners[ evt_type ][ ""+self.id ] = { t: self, f: cb, };
			return self;
		}

		self.ignore = function( evt_type ) {
			let self = this;
			if( listeners[ evt_type ] !== undefined ) {
				delete listeners[ evt_type ][ ""+self.id ];
			}
			return self;
		};

		// remove the thing from all listeners
		self.ignore_all = function() {
			for( let type in listeners ) {
				for( let o of Object.values( listeners[ type ] ) ) {
					if( self === o.t ) {
						self.ignore( type );
					}
				}
			}
		};

		self.destroy = function() {
			self.ignore_all();
			delete self;
		};

		return self;
	}

	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Squids
	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Squids are Things but in addition they have:
	//		- visual imagery
	//		- spatial position and simple motion
	//		- simple gravity (acceleration)
	//		- collisions (simple rectangle or circle)
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// vector creator function
	//
	// vec()			=  { x:0, y:0, z:0 }
	// vec( 1 )			=  { x:1, y:1, z:1 }
	// vec( 1, 2, 3 )	=  { x:1, y:1, z:1 }
	// vec( v )			=  { x:v.x, y:v.y, z:v.z } (clone)
	vec = function( x = 0, y = 0, z = 0 ) {

		if( typeof x === "number" ) {
			if( arguments.length == 1 ) {
				y = x; z = x;
			}
		} else {
			y = x.y; z = x.z; x = x.x;
		}
		let v = {
			x, y, z,
		};

		/*
		these modify a vec in place:
			v.add()	- add
			v.sub()	- subtract
			v.mlt()	- multiply
			v.div()	- divide
	
		example:
			let v = vec(1,2);
			let v2 = vec(v).add(1,1).mlt(2)
			//  v is x=1 y=2
			// v2 is x=4 y=6
		*/
		v.add = function(x = 0, y = 0, z = 0) {
			if( typeof x === "number" ) {
				if( arguments.length == 1 ) {
					z = y = x;
				}
			} else {
				z = x.z; y = x.y; x = x.x;
			}
			v.x += x, v.y += y, v.z += z;
			return v;
		}

		v.sub = function(x = 0, y = 0, z = 0) {
			if( typeof x === "number" ) {
				if( arguments.length == 1 ) {
					z = y = x;
				}
			} else {
				z = x.z; y = x.y; x = x.x;
			}
			v.x -= x, v.y -= y, v.z -= z;
			return v;
		}

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

		v.div = function(x = 0, y = 0, z = 0) {
			if( typeof x === "number" ) {
				if( arguments.length == 1 ) {
					z = y = x;
				}
			} else {
				z = x.z; y = x.y; x = x.x;
			}
			v.x /= x, v.y /= y, v.z /= z;
			return v;
		}

		v.length = function() {
			return sqrt( ( v.x * v.x ) + ( v.y * v.y ) );
		};

		return v;
	};

	// internal, generic, default squid drawing function
	let simple_draw = function( sq ) {
		let img = sq.image;
		if( ! img )
			return;
		let scl = sq.scale;
		let dw = img.w * scl;	// width of scaled img to dest
		let dh = img.h * scl;	// height of scaled img to dest
		let px = sq.position.x;
		let py = sq.position.y;
		let dx = px - (dw / 2);	// offset left 1/2 img width
		let dy = py - (dh / 2);	// offset up 1/2 img height
		let pvtx = dw * 0.5;
		let pvty = dh * 0.5;
		draw_image( img, dx, dy, sq.opacity, sq.rotation, pvtx, pvty, scl, scl );
		if( debug ) {
			// draw a crosshair at the squid pos
			draw_cross( px, py, 10, "#0ff" );
			// draw hit_shape
			let sh = sq.hit_shape;
			if( sh !== null && sh !== undefined ) {
				if( typeof sh === "number" ) {
					// circle
					draw_circle( px, py, sh * scl, "#ff0" );
				} else {
					let x = px - ( ( sh.x * scl ) * 0.5 );
					let y = py - ( ( sh.y * scl ) * 0.5 );
					draw_rect( x, y, sh.x * scl, sh.y * scl, "#ff0" );
				}
			}
		}
	}

	// Squid constructor
	Squid = function( position = vec( 0, 0 ), img = null, rot = 0, opa = 1, scl = 1 ) {

		const self = new Thing();

		// graphics related
		self.image = img;
		self.rotation = rot;
		self.opacity = opa;
		self.scale = scl;
		self.pivot = vec( 0, 0 );

		// set up default drawing
		let draw_pri = 0;
		self.listen( "draw_"+draw_pri, () => {
			simple_draw( self );
		} );

		// method to change visual draw priority
		self.draw_priority = function( n ) {
			if( n === undefined )
				return draw_pri;
			self.ignore( "draw_"+draw_pri );	// remove current draw listener
			n = toInt( n );
			if( n < 0 ) n = 0;	// clip to valid int value
			if( n > 5 ) n = 5;
			draw_pri = n;		// store new pri
			self.listen( "draw_"+draw_pri, () => {	// install new draw listner
				simple_draw( self );
			} );
			return self;
		}

		// motion/physics related
		self.position = position;
		self.velocity = vec( 0, 0 );
		self.velocity_limit = null;
		self.gravity = vec( 0, 0 );

		// rotate this squid to face another squid
		self.rotate_to = function( other ) {
			self.rotation = azimuth( self.position, other.position );
			return self;
		};

		// hit_shape can be one of:
		//		* null		no collision for this squid
		//		* number	circle collision with this radius
		//		* vec		rect collision with this width and hight
		self.hit_shape = null;

		self.move = function() {
			if( self.position && self.velocity ) {
				self.position = vec( self.position ).add( self.velocity );
				if( typeof self.velocity_limit !== "number" || self.velocity.length() <= self.velocity_limit )
					self.velocity = vec( self.velocity ).add( self.gravity );
			}
			return self;
		};

		self.animate = function() {
			if( self.anim ) {
				self.image = self.anim.next();
			}
		}

		// apply thrust to a squid in the direction that it's facing.
		// TODO modify velocity without making new vecs
		self.thrust = function( amount ) {
			let c = cartes( self.rotation );
			let nvel = vec( self.velocity ).add( c.mlt( amount ) );
			if( typeof self.velocity_limit !== "number" || nvel.length() <= self.velocity_limit ) {
				self.velocity = nvel;
			}
			return self;
		};

		return self;
	};


	//	-	-	-	-	-	-	-	-	-	-	-	-

	Anim = function( imgs, fps = 10, loop = true, playing = true ) {

		let delay = 100 / fps;
		let ts_start = Date.now();

		let anim = {
			imgs,
			loop,
			playing,
			fps,
			delay,
			frame: 0,
		};

		anim.play = function() {
			anim.frame = 0;
			anim.playing = true;
			ts_start = Date.now();
			return anim;
		};

		anim.stop = function() {
			anim.playing = false;
			return anim;
		}

		anim.next = function() {
			if( anim.playing ) {
				let ts_elapsed = Date.now() - ts_start;
				anim.frame = toInt( ts_elapsed / ( 1000 / fps ) );
				if( anim.frame >= imgs.length ) {
					// trying to step to next, non-existent frame.
					if( loop ) {
						anim.frame = 0;
						ts_start = Date.now();
					} else {
						anim.playing = false;
						anim.frame = imgs.length - 1;
					}
				}
			}
			return imgs[ anim.frame ];
		}

		return anim;

	};

	// advance animation for all squids listening for "tick"
	let animate = function( tickers ) {
		for( let o of tickers ) {
			let sq = o.t;
			if( typeof sq.animate === "function" ) {
				sq.animate();
			} else {
				// probably a Thing
			}
		}
	};


	//	-	-	-	-	-	-	-	-	-	-	-	-

	// Newton
	// internal, generic, default motion/gravity computation
	let newton = function( tickers ) {
		for( let o of tickers ) {
			let sq = o.t;
			if( typeof sq.move === "function" ) {
				sq.move();
			} else {
				// probably a Thing
			}
		}
	};


	// takes a source position and a target position and 
	// returns a number from 0.0 thru PI * 2 that represents the angle
	// between the two, or the "heading" from source to target
	azimuth = function( s_pos, t_pos ) {
		let a = atan2( t_pos.y - s_pos.y, t_pos.x - s_pos.x ) + PIH;
		return a;
	}

	// converts a heading/angle to cartesion coords for a distance of 1.0
	// passing in a vec as 'v' makes it write into that vec rather than
	// creating a new one.
	cartes = function( az, v ) {
		az = az - PI;
		if( ! v ) 
			return vec( sin(az), -cos(az) );
		v.x = sin(az);
		v.y = -cos(az);
		return v;
	}


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// Collisions
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	// test for circle to circle collision
	// assumes both hit shapes are set and of the correct type
	collide_rad_rad = function( sq1, sq2 ) {
		let scl1 = sq1.scale;
		let scl2 = sq2.scale;
		let rr = ( ( sq1.hit_shape * scl1 ) + ( sq2.hit_shape * scl2 ) );
		let rhit = rr * rr;
		let xx = abs( sq2.position.x - sq1.position.x );
		let yy = abs( sq2.position.y - sq1.position.y );
		let rdist = (xx * xx) + (yy * yy);
		return rdist < rhit;
	};

	// test for rect to circle collision
	// assumes both hit shapes are set and of the correct type
	collide_rect_rad = function( sq1, sq2 ) {
		let scl1 = sq1.scale;
		let hw = ( sq1.hit_shape.x * scl1 ) * 0.5;
		let hh = ( sq1.hit_shape.y * scl1 ) * 0.5;
		let rad = sq2.hit_shape * sq2.scale;
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

	// test for rect to rect collision
	// assumes both hit shapes are set and of the correct type
	collide_rect_rect = function( sq1, sq2 ) {

		// scale up the hit rects
		let p1 = sq1.position;
		let p2 = sq2.position;
		let sz1 = vec( sq1.hit_shape ).mlt( sq1.scale );
		let sz2 = vec( sq2.hit_shape ).mlt( sq2.scale );

		let d = abs( p1.x - p2.x );
		let s = ( sz1.x + sz2.x ) * 0.5;
		if( d > s )
			return false;

		d = abs( p1.y - p2.y );
		s = ( sz1.y + sz2.y ) * 0.5;
		if( d > s )
			return false;

		return true;
	};

	// test for a collision between 2 squids.
	collide_squids = function( sq1, sq2 ) {
		let sh1 = sq1.hit_shape;
		let sh2 = sq2.hit_shape;
		if( sh1 === null || sh1 === undefined || sh2 === null || sh2 === undefined ) 
			return false;	// need two actual shapes to make a collision
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

	// run simple collision detection on all squids that are 
	// listening for the "collide" event.
	collide = function() {
		if(!listeners) return;
		if(!listeners["collide"]) return;
		let colliders = Object.values( listeners[ "collide" ] );
		for( let co1 of colliders ) {
			for( let co2 of colliders ) {
				let sq1 = co1.t;
				let sq2 = co2.t;
				if( sq1 === sq2 )
					continue;	// don't collide with yourself
				if( ! collide_squids( sq1, sq2 ) )
					continue;
				// call collide event listener on sq1
				// when we get around to testing sq2 against sq1
				// we'll end up doing the same for sq2 (TODO: Optimize this)
				co1.f.apply( sq1, [ sq2, sq1 ] );
			}
		}
	}


	// test to see if a point is within a squid's collition shape
	collide_pos_squid = function( pos, sq2 ) {
		// TODO: making a squid every time this test is run is a bad idea.
		// Instead, make a singleton squid just for this function, set it's pos and then test.
		let sq1 = new Squid( pos );	// XXX make a fake squid just for the test.
		sq1.hit_shape = 1;
		return collide_rad_rad( sq1, sq2 );
	}


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// ticking loop
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	let may_tick = false;
	let num_ticks = 0;
	let ts_last = Date.now();

	const tick_func = function() {
		num_ticks += 1;
		if( may_tick ) {
			// compute delta
			// XXX make this a multiplier rather than an elapsed millis
			let ts_now = Date.now();
			let delta = ts_now - ts_last;
			ts_last = ts_now;

			event_dispatch( "pre_tick", delta, num_ticks );
			let tickers = event_dispatch( "tick", delta, num_ticks );
			event_dispatch( "post_tick", delta, num_ticks );

			newton( tickers );
			event_dispatch( "physics", delta, num_ticks );

			animate( tickers );

			event_dispatch( "pre_collide", delta, num_ticks );
			collide();		// run collision detection
			event_dispatch( "post_collide", delta, num_ticks );
		}
		setTimeout( tick_func, 10 );
	};
	tick_func();


	// tick( bool )	turn ticking on/off
	// tick()		return ticking on/off status
	tick = function( yesno ) {
		if( yesno !== undefined )
			may_tick = !!yesno;
		return may_tick;
	}


	//	-	-	-	-	-	-	-	-	-	-	-	-	-
	// drawing loop
	//	-	-	-	-	-	-	-	-	-	-	-	-	-

	let num_draws = 0;

	const frame = function() {
		num_draws += 1;

		// TODO: use clearRect and let static css canvas color be the clear color
		ctx.clearRect( 0, 0, canvas.width, canvas.height);

		event_dispatch( "pre_draw", num_draws );

		// use these to group graphics in to visual priority layers
		event_dispatch( "draw_0", num_draws );
		event_dispatch( "draw_1", num_draws );
		event_dispatch( "draw_2", num_draws );
		event_dispatch( "draw", num_draws );
		event_dispatch( "draw_3", num_draws );
		event_dispatch( "draw_4", num_draws );
		event_dispatch( "draw_5", num_draws );

		if( debug ) {
			if( ! dbg_font ) {
				dbg_font = load_font( "courier", DBG_FONT_SIZE, "#ff0" );
				dbg_font_shadow = load_font( "courier", DBG_FONT_SIZE, "rgba(0,0,0,0.5)" );
			}
			
			let y = DBG_LINE_HEIGHT;
			for( let m of dbg_msgs ) {
				if( m === undefined )
					m = ""
				draw_text( m, DBG_FONT_SIZE, y + DBG_SHADOW_OFFSET, dbg_font_shadow, "left", 0.9 );
				draw_text( m, DBG_FONT_SIZE, y, dbg_font, "left", 0.9 );
				y += DBG_LINE_HEIGHT;
			}
		}

		event_dispatch( "post_draw", num_draws );

		requestAnimationFrame( frame );
	}

	requestAnimationFrame( frame );

	//	-	-	-	-	-	-	-	-	-	-	-	-	-

} )();

globalThis.input_mapper = {
	gamepads: []
}

function newInputType(type = "", inputs = [""])
{
	let o = new Thing();

		o.inputs = inputs;
		o.pressed = false;
		o.listen("tick", function()
		{
			o.pressed = false;
			o.inputs.forEach(function(k)
			{
				if(k.startsWith("gpbutton:"))
				{
					let index = k.split(":")[1];
					let gamepad = input_mapper.gamepads[0];
					if(!gamepad)
					{
						return;
					}

					let button = gamepad.buttons[index]

					if(button)
					{
						if(button.pressed)
						{
							o.pressed = true;
						}
					}
				}
				if(k.startsWith("gpaxis:"))
				{
					let gpkey = k.split(":")[1];
					let gamepad = input_mapper.gamepads[0];
					if(!gamepad)
					{
						return;
					}


					let index = 0;
					switch(gpkey)
					{
						case "left_stick_horizontal":
							index = 0;
							break;

						case "left_stick_vertical":
							index = 1;
							break;
					}

					o.pressed = true;
					o.value = gamepad.axes[index];
				}
				else
				{
					if(keys[k] === true)
					{
						o.pressed = true;
					}
				}
			});
		})

	input_mapper[type] = o;
	return input_mapper[type];
}


let input = new Thing();

input.listen("tick", function()
{
	let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	input_mapper.gamepads = gamepads || [];
});

window.addEventListener("gamepadconnected", function(e) {
	let gamepad = e.gamepad;
	gamepad.mapping = "standard";
	if(!input_mapper.gamepads[gamepad.index])
	{
		input_mapper.gamepads[gamepad.index] = gamepad;
	}
});

window.addEventListener("gamepaddisconnected", function(e) {
	let gamepad = e.gamepad;
	delete input_mapper.gamepads[gamepad.index];
});let AnimatedSprite = function(images, framerate = 10)
{

	let o = new Thing();
		o.frames = images;
		o.framerate = framerate;
		o.images = images
		o.current_frame = 0;
		o.playing = false;
		o.advance_frame = function(num_ticks)
		{
			if(num_ticks % o.framerate === 0)
			{
				if(!Object.keys(o.frames))
				{
					return;
				}
				// set next frame to draw
				if(o.current_frame === Object.keys(o.frames).length - 1)
				{
					o.current_frame = -1;
				}
				o.current_frame += 1;
			}
		}
		o.play = function()
		{
			o.playing = true;
		}
		o.stop = function()
		{
			// stop on current frame
			o.playing = false;
		}
		o.playing_frame = function()
		{
			let f = o.frames[o.current_frame];
			return f;
		}
		o.listen("tick", function(delta, num_ticks)
		{
			if(o.playing)
			{
				o.advance_frame(num_ticks);
			}
		})

	return o;
}

let AnimatedSquid = function(position = vec(0, 0), prefix, images, framerate = 10, playing = true)
{
	let a = new AnimatedSprite(prefix, images, framerate);
		a.playing = playing;
	let o = new Squid(position, a.frames[0]);
		o.animations = {};
		o.animations[0] = a;
		o.current_animation = o.animations[0];
		o.listen("pre_tick", function(delta, num_ticks)
		{
			o.image = o.current_animation.playing_frame();
		});

	return o;
}
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("AS",[],e):"object"==typeof exports?exports.AS=e():t.AS=e()}(window,(function(){return function(t){var e={};function i(r){if(e[r])return e[r].exports;var n=e[r]={i:r,l:!1,exports:{}};return t[r].call(n.exports,n,n.exports,i),n.l=!0,n.exports}return i.m=t,i.c=e,i.d=function(t,e,r){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(r,n,function(e){return t[e]}.bind(null,n));return r},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";var r,n,o=this&&this.__extends||(r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])})(t,e)},function(t,e){function i(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)});Object.defineProperty(e,"__esModule",{value:!0}),function(t){t[t.ExactFit=1]="ExactFit",t[t.NoBorder=2]="NoBorder",t[t.FullHeight=3]="FullHeight",t[t.FullWidth=4]="FullWidth",t[t.ShowAll=5]="ShowAll"}(n=e.POLICY||(e.POLICY={}));var h=function(t,e){this.width=t,this.height=e};e.Size=h;var u=function(t){function e(e,i,r,n){var o=t.call(this,e,i)||this;return o.x=r,o.y=n,o}return o(e,t),e}(h);e.Rect=u,e.getScaledRect=function(t){var e=t.container,i=t.target,r=t.policy,o=(e.width,e.height,new h(e.width/i.width,e.height/i.height)),c=!1,a=new u(0,0,0,0),l=new h(i.width,i.height);switch(r){case n.ExactFit:break;case n.NoBorder:o.width=o.height=Math.max(o.width,o.height);break;case n.ShowAll:o.width=o.height=Math.min(o.width,o.height);break;case n.FullWidth:o.height=o.width,l.width=Math.ceil(e.width/o.width);break;case n.FullHeight:o.width=o.height,l.height=Math.ceil(e.height/o.height);break;default:a.x=a.y=0,a.width=i.width,a.height=i.height,c=!0}if(!c){var d=l.width*o.width,f=l.height*o.height;a={x:(e.width-d)/2,y:(e.height-f)/2,width:d,height:f}}return a}}])}));
//# sourceMappingURL=adaptive-scale.js.map
let canvas_size = { x: 0, y: 0, width: 0, height: 0 };
let mouse = vec(0, 0);

function scale_canvas(screen)
{
	console.log(screen.x, screen.y);
	canvas.style.width = "unset";
	canvas.style.height = "unset";
	canvas.style.top = "unset";
	canvas.style.left = "unset";

	canvas_size.width = screen.x;
	canvas_size.height = screen.y;

	canvas.width = screen.x;
	canvas.height = screen.y;

	let squids_scaler = new Thing();
	squids_scaler.listen("tick", function()
	{
		let originalWidth = canvas_size.width;
		let originalHeight = canvas_size.height;

		let options = {
			container: new AS.Size(window.innerWidth, window.innerHeight),
			target: new AS.Size(originalWidth, originalHeight),
			policy: AS.POLICY.ShowAll
		};

		let rect = AS.getScaledRect(options);

		canvas_size.x = rect.x;
		canvas_size.y = rect.y;
		canvas_size.width = rect.width;
		canvas_size.height = rect.height;

		canvas_size.scale = screen.x / rect.width;

		canvas.style.width = canvas_size.width + "px";
		canvas.style.height = canvas_size.height + "px";

		canvas.style.top = canvas_size.y + "px";
		canvas.style.left = canvas_size.x + "px";
	});

	squids_scaler.listen("mousemove", function(mx, my, event)
	{
		mouse = local_mouse(event.clientX, event.clientY);
	});
}

function local_mouse(mx, my)
{
	let px = ((mx) - canvas_size.x) * canvas_size.scale;
	let py = ((my) - canvas_size.y) * canvas_size.scale;

	return vec(px, py)
}