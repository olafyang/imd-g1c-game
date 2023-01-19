import UIElementFactory from "./ui.js";

const factory = new UIElementFactory();
const btn0 = factory.newButton("rect", 100, 100, 100, 50, {});
const slider0 = factory.newSlider(100, 200, 200, 20, "horizontal", 0, {});
const slider1 = factory.newSlider(150, 300, 200, 20, "vertical", 0, {});

window.setup = function () {
  createCanvas(900, 900);
  background(20);
};

window.draw = function () {
  background(20);
  btn0.activate();
  slider0.activate();
  slider1.activate();
};
