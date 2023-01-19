import UIElementFactory from "./ui.js";
// import * as p5 from "./p5.js";
// import "./p5.sound.js"

// const tapSfx = loadSound("assets/sfx/CYCdh_ElecK01-Snr03.wav")

const keyMap = {
  0: 83,
  1: 68,
  2: 70,
  3: 74,
  4: 75,
  5: 76,
};
let activeKeypress = [];

new p5((sketch) => {
  const factory = new UIElementFactory(sketch);

  const btn0 = factory.newButton("rect", 100, 100, 100, 50, {});
  const slider0 = factory.newSlider(100, 200, 200, 20, "horizontal", 0, {});
  const slider1 = factory.newSlider(150, 300, 200, 20, "vertical", 0, {});

  sketch.setup = function () {
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.background(20);
  };

  sketch.draw = function () {
    sketch.background(20);

    sketch.fill("#222845");
    sketch.rect(0, 0, 600, sketch.height);

    for (let i = 0; i < 6; i++) {
      if (activeKeypress.includes(keyMap[i])) {
        sketch.fill("#65d4e6");
      } else {
        sketch.fill("#ffffff");
      }
      sketch.rect(100 * i, sketch.height - 125, 100, 50);
    }

    sketch.fill(255);
    sketch.text(activeKeypress, 200, 200);
    btn0.activate();
    slider0.activate();
    slider1.activate();
  };

  sketch.keyPressed = function (e) {
    if (activeKeypress.indexOf(e.keyCode) === -1) {
      activeKeypress.push(e.keyCode);
    }
  };

  sketch.keyReleased = function (e) {
    const keyIndex = activeKeypress.indexOf(e.keyCode);
    if (keyIndex !== -1) {
      activeKeypress.splice(keyIndex, 1);
    }
  };
});
