import Renderer from '@/renderer';
import Router from '@/router';
import scenes from '@/scenes';

// Setup renderer
const mount = document.getElementById('mount');
const renderer = new Renderer({
  mount,
});

// Setup browser router
// eslint-disable-next-line no-unused-vars
const router = new Router({
  scenes,
  onUpdate: renderer.setScene.bind(renderer),
});
