class Entity {
  triggerTime;
  width;

  constructor(triggerTime, width) {
    this.triggerTime = triggerTime;
    this.width = width;
  }
}

class TapEntity extends Entity {
  // Represents a sigle tap entity
  link;

  constructor(triggerTime, width, link) {
    super(triggerTime, width);
    this.link = link;
  }
}

class HoldEntity extends Entity {
  // Represents a sigle hold entity
  duration;

  constructor(triggerTime, duration, width) {
    super(triggerTime, width);
    this.duration = duration;
  }
}

class Lane {
  // Represents a single lane, contains all interactable entities
  laneNr;
  entities = [];

  constructor(laneNr) {
    this.laneNr = laneNr;
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  getActiveEntities(start, end) {
    let ahead = this.entities.filter(
      (entity) => entity.triggerTime > start && entity.triggerTime < end
    );
    return ahead;
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

  // Gameplay Resources
  waitTimeBeforeStart;
  levelStartTime;
  millisecondsPerPixel;

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

  async loadLevel(context, difficulty, millisecondsPerPixel) {
    this.context = context;
    this.waitTimeBeforeStart = millisecondsPerPixel * (context.height - 60);
    this.lanes = [
      new Lane(0),
      new Lane(1),
      new Lane(2),
      new Lane(3),
      new Lane(4),
      new Lane(5),
    ];

    return new Promise((resolve, reject) => {
      // load song file
      this.songFile = context.loadSound(
        `/assets/levels/${this.levelName}/song.mp3`,
        () => {
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
                      time = Number(word);
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
                          new HoldEntity(time, duration, width)
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

                this.loaded = true;
                resolve(this);
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

  play(levelStartTime, millisecondsPerPixel) {
    if (!this.levelStartTime) {
      this.levelStartTime = levelStartTime;
      this.millisecondsPerPixel = millisecondsPerPixel;
    }

    let playhead =
      Date.now() - this.levelStartTime - this.waitTimeBeforeStart - 3500;

    if (!this.songFile.isPlaying() && playhead > 0) {
      this.songFile.play();
    }

    this.context.push();
    //
    for (let lane of this.lanes) {
      let laneActiveEntities = lane.getActiveEntities(
        playhead - 10000,
        playhead + this.millisecondsPerPixel * this.context.height + 10000
      );
      const entityX = 100 * lane.laneNr;

      for (let entity of laneActiveEntities) {
        const entityY =
          this.context.height -
          60 -
          (entity.triggerTime - playhead + 100) / this.millisecondsPerPixel;
        if (entityY > this.context.height - 120) {
          this.context.fill("#FF0B12");
        } else {
          this.context.fill("#ffffff");
        }
        this.context.rect(entityX, entityY - 25, 100 * entity.width, 50);
      }
    }

    //
    this.context.pop();
  }

  [Symbol.iterator]() {
    let index = -1;
  }
}
