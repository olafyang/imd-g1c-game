class Entity {
  triggerTime;

  constructor(triggerTime) {
    this.triggerTime = triggerTime;
  }
}

class TapEntity extends Entity {
  // Represents a sigle tap entity
  width;
  link;

  constructor(triggerTime, width, link) {
    super(triggerTime);
    this.width = width;
    this.link = link;
  }
}

class HoldEntity extends Entity {
  // Represents a sigle hold entity
  duration;

  constructor(triggerTime, duration) {
    super(triggerTime);
    this.duration = duration;
  }
}

class Lane {
  // Represents a single lane, contains all interactable entities
  laneNr;
  entities = [];

  constructor() {}

  addEntity(entity) {
    this.entities.push(entity);
  }
}

export class Level {
  // metadata
  context; // p5js sketch
  levelName;
  displayName;
  creditLyrics;
  creditMusic;
  creditArrangement;
  creditVocal;
  avalibleDifficulties;
  loaded;

  // Level Resources (load only if entering gameplay)
  songFile;
  currentDifficulty;
  lanes;

  constructor(levelObj) {
    this.levelName = levelObj.name;
    this.displayName = levelObj.displayName;
    this.creditLyrics = levelObj.meta.lyrics;
    this.creditMusic = levelObj.meta.music;
    this.creditArrangement = levelObj.meta.arrangement;
    this.creditVocal = levelObj.meta.vocal;
    this.avalibleDifficulties = levelObj.levels;
    this.loaded = false;
  }

  async loadLevel(context, difficulty) {
    this.lanes = [
      new Lane(),
      new Lane(),
      new Lane(),
      new Lane(),
      new Lane(),
      new Lane(),
    ];

    return new Promise((resolve, reject) => {
      // load song file
      this.songFile = context.loadSound(
        `/assets/levels/${this.levelName}/song.mp3`,
        (data) => {
          this.songfile = data;

          // load entities
          fetch(`/assets/levels/${this.levelName}/${difficulty}.txt`)
            .then((res) => {
              if (!res.ok) {
                reject(
                  `Failed to load level "${difficulty}" of "${this.displayName}"`
                );
              }
              return res.body;
            })
            .then((data) => {
              const reader = data.getReader();

              reader.read().then(({ done, value }) => {
                if (done) {
                  return;
                }

                let element = [];
                let time;
                let newLine = true;
                for (let w of value) {
                  if (w === 32 || w === 10) {
                    let word = String.fromCharCode(...element);

                    // parse time
                    if (newLine) {
                      word = Number(word);
                      time = word;
                      newLine = false;
                    } else {
                      // parse entities
                      const entity = word.split(":");
                      const lane = entity[0];
                      const type = entity[1];
                      let width = 1;
                      if (entity.length > 2) {
                        width = Number(entity[2]);
                      }

                      if (type === "tap") {
                        this.lanes[lane].addEntity(
                          new TapEntity(time, width, 0)
                        );
                      } else {
                        // hold entity
                        const duration = Number(type.split("-")[1]);

                        this.lanes[lane].addEntity(
                          new HoldEntity(time, duration)
                        );
                      }
                    }

                    if (w === 10) {
                      newLine = true;
                    }
                    element = [];
                    continue;
                  }

                  element.push(w);
                }

                console.log(this.lanes);
              });
            });
        },
        (error) => {
          reject(error);
        },
        (state) => {}
      );
    });
  }

  [Symbol.iterator]() {
    let index = -1;
  }
}
