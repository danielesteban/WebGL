import Renderer from '@/renderer';
import scenes from '@/scenes';

// Setup renderer
const mount = document.getElementById('mount');
// eslint-disable-next-line no-unused-vars
const renderer = new Renderer({
  mount,
  scenes,
});
