import * as VISUALIZER from "./visualizer";
import { updateTime } from './timeSlice';

let lastFrameTime = 0;
let engineTime = 0;
let initTime = 0;
let reduxStore;

export function init(_reduxStore) {
  reduxStore = _reduxStore;
  initTime = Date.now();
  VISUALIZER.init();

  requestAnimationFrame(engineUpdate);
}

export function visualizerResize() {
  VISUALIZER.resize();
}

export function visualizerSetElement(domRef) {
  VISUALIZER.setDomElement(domRef);
}

function engineUpdate(time) {
  requestAnimationFrame(engineUpdate);

  const dt = time - lastFrameTime;

  if (dt < 10) return;

  // For a video game, you might limit dt so that object in-game will never move too far in a given frame
  // However, it is more important that visuals maintain sync with real time
  // if (dt > 100) dt = 1000 / 30;

  lastFrameTime = time;
  engineTime += dt;

  reduxStore.dispatch(updateTime(dt));

  VISUALIZER.update(dt);

}
