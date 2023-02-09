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
fetch("levels.json")
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
  let millisecondsPerPixel = 2;

  const factory = new UIElementFactory(sketch);
  const titleUI = new UI();
  let gameTitle;
  let songCredit;
  let playBtn;
  let loadingText;
  let countDown3;
  let countDown2;
  let countDown1;
  let countDownGo;
  let levelTime;
  let gameplayStats = {
    perfect: 0,
    great: 0,
    good: 0,
    bad: 0,
    miss: 0,
  };
  let resultsUI = new UI();
  let resultsTitle;
  let resultsCombo;
  let resultsPerfect;
  let resultsGreat;
  let resultsGood;
  let resultsBad;
  let resultsMiss;
  let resultsReplayBtn;

  // gameplay variables
  let lastGrade;
  let combo = 0;
  let levelStartTime;

  let soundPressEmpty;

  sketch.preload = function () {
    sketch.soundFormats("mp3");
    soundPressEmpty = sketch.loadSound("assets/sfx/emptyTap.mp3");
  };

  sketch.setup = function () {
    sketch.createCanvas(600, window.innerHeight);
    sketch.background(20);
    sketch.frameRate(60);

    judgementHeight = sketch.height - 120;
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
    songCredit = factory.newText(
      "Song: VIVIDVELOCITY - Synthion",
      sketch.width / 2,
      260,
      20,
      0,
      "#ffffff",
      "#ffffff",
      sketch.NORMAL,
      sketch.CENTER
    );
    playBtn = factory.newButton(
      "Play",
      "rect",
      sketch.width / 2 - 50,
      300,
      100,
      50,
      () => {
        screenState = SCREEN_STATE.LOADING;

        availableLevels[1]
          .loadLevel(sketch, "easy", millisecondsPerPixel)
          .then((level) => {
            currentLevel = level;
            screenState = SCREEN_STATE.GAME;
            levelStartTime = Date.now();
          });
      }
    );

    titleUI.addElements(gameTitle, songCredit, playBtn);

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

    resultsReplayBtn = factory.newButton(
      "Play Again",
      "rect",
      sketch.width / 2 - 50,
      450,
      100,
      50,
      () => {
        location.reload();
      }
    );

    resultsUI.addElements(resultsReplayBtn);
  };

  sketch.draw = function () {
    sketch.background(20);

    sketch.fill("#222845");
    sketch.rect(0, 0, 600, sketch.height);

    sketch.fill(255);

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

        sketch.fill("#000000");
        sketch.textSize(15);
        sketch.textStyle(sketch.NORMAL);
        sketch.textAlign(sketch.CENTER);
        sketch.text(
          String.fromCharCode(keyMap.gameInput[i]),
          100 * i + 50,
          judgementHeight + 30
        );
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
        currentLevel.play(
          levelStartTime,
          millisecondsPerPixel,
          (grade) => {
            if (grade === "perfect") {
              gameplayStats.perfect++;
              combo++;
            } else if (grade === "great") {
              gameplayStats.great++;
              combo++;
            } else if (grade === "good") {
              gameplayStats.good++;
              combo = 0;
            } else if (grade === "bad") {
              gameplayStats.bad++;
              combo = 0;
            } else if (grade === "miss") {
              gameplayStats.miss++;
              combo = 0;
            }

            lastGrade = grade.toUpperCase();
          },
          () => {
            screenState = SCREEN_STATE.RESULTS;
          }
        );
      }

      // Display Combo & last grade
      sketch.push();
      sketch.textSize(20);
      sketch.textStyle(sketch.BOLD);
      sketch.textAlign(sketch.CENTER);

      sketch.text("COMBO", 500, 350);
      sketch.text(combo, 500, 375);
      sketch.pop();
    }

    if (screenState == SCREEN_STATE.RESULTS) {
      resultsTitle = factory.newText(
        "Results",
        sketch.width / 2,
        200,
        50,
        0,
        "#ffffff",
        "#ffffff",
        sketch.BOLD,
        sketch.CENTER
      );

      resultsCombo = factory.newText(
        `Combo: ${combo}`,
        sketch.width / 2,
        250,
        20,
        0,
        "#ffffff",
        "#ffffff",
        sketch.NORMAL,
        sketch.CENTER
      );

      resultsPerfect = factory.newText(
        `Perfect: ${gameplayStats.perfect}`,
        sketch.width / 2,
        280,
        20,
        0,
        "#ffffff",
        "#23FF10",
        sketch.NORMAL,
        sketch.CENTER
      );
      resultsGreat = factory.newText(
        `Great: ${gameplayStats.great}`,
        sketch.width / 2,
        310,
        20,
        0,
        "#ffffff",
        "#FFB017",
        sketch.NORMAL,
        sketch.CENTER
      );
      resultsGood = factory.newText(
        `Good: ${gameplayStats.good}`,
        sketch.width / 2,
        340,
        20,
        0,
        "#ffffff",
        "#0BFFE9",
        sketch.NORMAL,
        sketch.CENTER
      );
      resultsBad = factory.newText(
        `Bad: ${gameplayStats.bad}`,
        sketch.width / 2,
        370,
        20,
        0,
        "#ffffff",
        "#FF6B5D",
        sketch.NORMAL,
        sketch.CENTER
      );
      resultsMiss = factory.newText(
        `Miss: ${gameplayStats.miss}`,
        sketch.width / 2,
        400,
        20,
        0,
        "#ffffff",
        "#F30009",
        sketch.NORMAL,
        sketch.CENTER
      );
      resultsUI.addElements(
        resultsTitle,
        resultsCombo,
        resultsPerfect,
        resultsGreat,
        resultsGood,
        resultsBad,
        resultsMiss
      );

      // display results
      resultsUI.activate();
      // display replay btn
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
