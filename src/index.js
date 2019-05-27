import Renderer from '@/renderer';
/* eslint-disable no-unused-vars */
import {
  Level01,
  Level02,
} from '@/scenes';
/* eslint-enable no-unused-vars */

const mount = document.getElementById('mount');
const renderer = new Renderer({
  mount,
});

renderer.setScene(Level01);
// renderer.setScene(Level02);
