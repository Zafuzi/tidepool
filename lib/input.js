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
	input.debounce = 0;

input.listen("tick", function()
{
	let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	input_mapper.gamepads = gamepads || [];
	if(input.debounce > 0)
	{
		input.debounce -= 1;
	}
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
});