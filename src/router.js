import { createBrowserHistory } from 'history';
import pathToRegexp from 'path-to-regexp';

class Router {
  constructor({
    basename,
    scenes,
    onUpdate,
  }) {
    this.history = createBrowserHistory({
      basename,
    });
    this.scenes = scenes.map(({ path, scene }) => {
      const keys = [];
      return {
        test: pathToRegexp(path, keys),
        keys,
        scene,
      };
    });
    this.onUpdate = onUpdate;
    this.history.listen(this.onLocationUpdate.bind(this));
    if (window.location.hash) {
      this.history.replace(`/${window.location.hash.substr(2)}`);
    } else {
      this.onLocationUpdate(this.history.location);
    }
  }

  onLocationUpdate({ pathname }) {
    const { history, scenes } = this;
    const getMatchArgs = (match, keys) => match.slice(1).reduce((args, value, index) => ({
      ...args,
      [keys[index].name]: value,
    }), {});
    for (let i = 0; i < scenes.length; i += 1) {
      const { test, keys, scene } = scenes[i];
      const match = test.exec(pathname);
      if (match) {
        const args = getMatchArgs(match, keys);
        this.onUpdate(scene, args);
        return;
      }
    }
    history.replace('/');
  }

  goTo(path) {
    const { history } = this;
    history.push(path);
  }
}

export default Router;
