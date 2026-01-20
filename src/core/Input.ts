import Action from "@brianchirls/game-input/Action";
import DPadComposite from "@brianchirls/game-input/controls/DPadComposite";
import Gamepad from "@brianchirls/game-input/devices/Gamepad";
import Keyboard from "@brianchirls/game-input/devices/Keyboard";

export const InputGamepad = new Gamepad();
export const InputKeyboard = new Keyboard();
const leftStick = InputGamepad.getControl("leftStick");

const kbd_WASD = new DPadComposite({
	up: InputKeyboard.getControl("KeyW"),
	left: InputKeyboard.getControl("KeyA"),
	down: InputKeyboard.getControl("KeyS"),
	right: InputKeyboard.getControl("KeyD"),
});

const kbd_ARROW = new DPadComposite({
	up: InputKeyboard.getControl("ArrowUp"),
	left: InputKeyboard.getControl("ArrowLeft"),
	down: InputKeyboard.getControl("ArrowDown"),
	right: InputKeyboard.getControl("ArrowRight"),
});

export const InputMoveAction = new Action({
	bindings: [leftStick, kbd_WASD, kbd_ARROW],
});
