import fullscreen from 'fullscreen';
import { vec3, vec2 } from 'gl-matrix';
import pointerlock from 'pointer-lock';

class Input {
  constructor({ mount }) {
    this.buttons = {};
    this.keyboard = vec3.create();
    this.mouse = vec2.create();
    this.fullscreen = fullscreen(mount);
    this.onBlur = this.onBlur.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyboardDown = this.onKeyboardDown.bind(this);
    this.onKeyboardUp = this.onKeyboardUp.bind(this);
    this.pointerlock = pointerlock(mount);
    this.pointerlock.on('attain', this.onPointerLockAttain.bind(this));
  }

  onBlur() {
    const { keyboard } = this;
    this.buttons = {};
    vec3.set(keyboard, 0, 0, 0);
  }

  onPointerLockAttain(movements) {
    // const { fullscreen } = this;
    this.isLocked = true;
    window.addEventListener('blur', this.onBlur, false);
    window.addEventListener('mousedown', this.onMouseDown, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
    window.addEventListener('keydown', this.onKeyboardDown, false);
    window.addEventListener('keyup', this.onKeyboardUp, false);
    movements.on('data', this.onPointerMovement.bind(this));
    movements.on('close', this.onPointerLockClose.bind(this));
    // fullscreen.request();
  }

  onPointerLockClose() {
    const {
      // fullscreen,
      keyboard,
      mouse,
    } = this;
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('keydown', this.onKeyboardDown);
    window.removeEventListener('keyup', this.onKeyboardUp);
    this.isLocked = false;
    // fullscreen.release();
    vec3.set(keyboard, 0, 0, 0);
    vec2.set(mouse, 0, 0);
  }

  onPointerMovement({ dx, dy }) {
    const { mouse } = this;
    vec2.set(mouse, dx, dy);
  }

  onMouseDown({ button }) {
    const { buttons } = this;
    switch (button) {
      case 2:
        buttons.secondary = true;
        buttons.secondaryDown = true;
        break;
      default:
        buttons.primary = true;
        buttons.primaryDown = true;
    }
  }

  onMouseUp({ button }) {
    const { buttons } = this;
    switch (button) {
      case 2:
        if (buttons.secondary) {
          buttons.secondary = false;
          buttons.secondaryUp = true;
        }
        break;
      default:
        if (buttons.primary) {
          buttons.primary = false;
          buttons.primaryUp = true;
        }
    }
  }

  onKeyboardDown({ keyCode, repeat }) {
    const { keyboard } = this;
    if (repeat) return;
    switch (keyCode) {
      case 65:
        keyboard[0] = -1;
        break;
      case 68:
        keyboard[0] = 1;
        break;
      case 16:
        keyboard[1] = -1;
        break;
      case 32:
        keyboard[1] = 1;
        break;
      case 83:
        keyboard[2] = -1;
        break;
      case 87:
        keyboard[2] = 1;
        break;
      default:
        break;
    }
  }

  onKeyboardUp({ keyCode, repeat }) {
    const { keyboard } = this;
    if (repeat) return;
    switch (keyCode) {
      case 65:
        if (keyboard[0] < 0) keyboard[0] = 0;
        break;
      case 68:
        if (keyboard[0] > 0) keyboard[0] = 0;
        break;
      case 16:
        if (keyboard[1] < 0) keyboard[1] = 0;
        break;
      case 32:
        if (keyboard[1] > 0) keyboard[1] = 0;
        break;
      case 83:
        if (keyboard[2] < 0) keyboard[2] = 0;
        break;
      case 87:
        if (keyboard[2] > 0) keyboard[2] = 0;
        break;
      default:
        break;
    }
  }
}

export default Input;
