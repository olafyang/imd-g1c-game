import { UIElementFactory, UI } from "./ui.js";
import { Level } from "./level.js";
import "./p5.sound.js";
import * as SCREEN_STATE from "./screenState.js";

let screenState = SCREEN_STATE.MAIN_MENU;
let screenTransitionState = 0;
let currentLevel;

const keyMap = {
  gameInput: {
    0: 83,
    1: 68,
    2: 70,
    3: 74,
    4: 75,
    5: 76,
  },
  escape: 27,
  enter: 13,
  arrowUp: 38,
  arrowDown: 40,
  arrowLeft: 37,
  arrowRight: 39,
};

let activeKeypress = [];

// fetch levels
let availableLevels = [];
fetch("/levels.json")
  .then((res) => {
    if (!res.ok) {
      throw Error("Error fetching levels");
    }
    return res.json();
  })
  .then((data) => {
    for (let lvl of data.levels) {
      availableLevels.push(new Level(lvl));
    }
  })
  .catch((err) => {
    // TODO Handle error and display message
  });

new p5((sketch) => {
  let judgementHeight;
  let millisecondsPerPixel = 4;

  const factory = new UIElementFactory(sketch);
  const titleUI = new UI();
  let gameTitle;
  let playBtn;
  let loadingText;
  let countDown3;
  let countDown2;
  let countDown1;
  let countDownGo;
  let levelTime;

  // gameplay variables
  let levelStartTime;

  let soundPressEmpty;

  sketch.preload = function () {
    sketch.soundFormats("mp3");
    soundPressEmpty = sketch.loadSound("/assets/sfx/emptyTap.mp3");
  };

  sketch.setup = function () {
    sketch.createCanvas(600, window.innerHeight);
    sketch.background(20);
    sketch.frameRate(60);

    judgementHeight = sketch.height - 120;
    console.log("judgementHeight: ", judgementHeight);

    // initialize UI

    // main menu
    gameTitle = factory.newText(
      "Rhythm Game",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );
    playBtn = factory.newButton(
      "Play Demo",
      "rect",
      sketch.width / 2 - 50,
      300,
      100,
      50,
      () => {
        screenState = SCREEN_STATE.LOADING;

        availableLevels[0]
          .loadLevel(sketch, "easy", millisecondsPerPixel)
          .then((level) => {
            currentLevel = level;
            screenState = SCREEN_STATE.GAME;
            levelStartTime = Date.now();
          });
      }
    );

    // Loading
    loadingText = factory.newText(
      "Loading",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );

    // Game
    countDown3 = factory.newText(
      "3",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );
    countDown2 = factory.newText(
      "2",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );
    countDown1 = factory.newText(
      "1",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );
    countDownGo = factory.newText(
      "GO!",
      sketch.width / 2,
      200,
      50,
      0,
      "#ffffff",
      "#ffffff",
      sketch.BOLD,
      sketch.CENTER
    );

    titleUI.addElements(gameTitle, playBtn);
  };

  sketch.draw = function () {
    sketch.background(20);

    sketch.fill("#222845");
    sketch.rect(0, 0, 600, sketch.height);

    sketch.fill(255);

    // sketch.text(activeKeypress, 200, 100);
    if (screenState === SCREEN_STATE.MAIN_MENU) {
      titleUI.activate();
    }

    if (screenState === SCREEN_STATE.LOADING) {
      loadingText.activate();
    }

    if (screenState === SCREEN_STATE.GAME) {
      sketch.push();
      for (let i = 0; i < 6; i++) {
        if (activeKeypress.includes(keyMap.gameInput[i])) {
          sketch.fill("#65d4e6");
        } else {
          sketch.fill("#ffffff");
        }
        sketch.rect(100 * i, judgementHeight, 100, 50);
      }
      sketch.pop();

      levelTime = Date.now() - levelStartTime;

      if (levelTime < 1000) {
        countDown3.activate();
      } else if (levelTime < 2000) {
        countDown2.activate();
      } else if (levelTime < 3000) {
        countDown1.activate();
      } else if (levelTime < 3500) {
        countDownGo.activate();
      } else {
        currentLevel.play(levelStartTime, millisecondsPerPixel);
      }

      sketch.text(Date.now() - levelStartTime, 100, 100);
    }
  };

  // Handle Keypress
  sketch.keyPressed = function (e) {
    if (activeKeypress.indexOf(e.keyCode) === -1) {
      if (screenState === SCREEN_STATE.GAME) {
        if (Object.values(keyMap.gameInput).includes(e.keyCode)) {
          for (const [key, val] of Object.entries(keyMap.gameInput)) {
            if (val === e.keyCode) {
              currentLevel.judge(key, Date.now());
            }
          }
          soundPressEmpty.play(0, 1, 0.1);
        }
      }
      activeKeypress.push(e.keyCode);
    }
  };

  // Handle Key Release
  sketch.keyReleased = function (e) {
    const keyIndex = activeKeypress.indexOf(e.keyCode);
    if (keyIndex !== -1) {
      activeKeypress.splice(keyIndex, 1);
    }
  };
});
