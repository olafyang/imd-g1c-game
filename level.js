class TapEntity {
  // Represents a sigle tap entity
  triggerTime;
  width;
  link;
}

class HoldEntity {
  // Represents a sigle hold entity
  triggerTime;
  duration;
}

class Lane {
  // Represents a single lane, contains all interactable entities
  laneNr;
  entities;
}

class Level {
  song; // p5.SoundFile
  lanes;

  constructor(levelID) {}

  [Symbol.iterator]() {
    let index = -1;
  }
}
