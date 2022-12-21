import ElectricGuitar from "tonejs-instrument-guitar-electric-mp3";
import Violin from "tonejs-instrument-violin-mp3";
import Harmonium from "tonejs-instrument-harmonium-mp3";
import Piano from "tonejs-instrument-piano-mp3";
import Clarinet from "tonejs-instrument-clarinet-mp3";
import Harp from "tonejs-instrument-harp-mp3";
import * as Tone from "tone";
import type {
  BaseDuration,
  Chord,
  Pitch,
  pitchLineParameters,
  ToneJSDuration,
  Vibe,
} from "./types";
import { bassNotes, middleNotes } from "./constants";
import {
  getDiminishedSeventh,
  getMajorFifth,
  getMajorFourth,
  getMinorSecond,
  getMinorSixth,
  getMinorThird,
  getRootMajor,
  getMajorThird,
  getThird,
  getFifth,
  getFlatThird,
  getFlatFifth,
  getNormalChords,
  includesChord,
  getFourth,
  getMajorPentatonicScale,
  getMinorPentatonicScale,
  getRootPower,
  getPowerSecond,
  getPowerThird,
  getPowerFourth,
  getPowerFifth,
  getPowerSixth,
  getAvailableNote,
  isSameModuloOctave,
  getFlatSecond,
  getSeventh,
} from "./keysAndChords";
import { tonejsDurationTo16thCount } from "./durations";
import {
  getBPM,
  getInstruments,
  getInitialMelodyParameters,
  getInitialCountermelodyParameters,
  incrementParameters,
} from "./vibes";

let instrumentVolume = -24;
const startCreepy = Math.random() > 0.5;
let currentVibe: Vibe = startCreepy ? "creepy" : "pleasentlypicky";

const violin = new Violin({
  minify: true,
}).toDestination("main");
const electricGuitar = new ElectricGuitar({
  minify: true,
}).toDestination("main");
const harmonium = new Harmonium({
  minify: true,
}).toDestination("main");
const piano = new Piano({
  minify: true,
}).toDestination("main");
const clarinet = new Clarinet({
  minify: true,
}).toDestination("main");
const harp = new Harp({
  minify: true,
}).toDestination("main");

const availableInstruments = {
  violin,
  electricGuitar,
  harmonium,
  piano,
  clarinet,
  harp,
};

export const addToneJSDurations = (
  durationObject1: ToneJSDuration,
  durationObject2: ToneJSDuration
) => {
  const newObject: ToneJSDuration = { ...durationObject1 };
  for (const [key, value] of Object.entries(durationObject2)) {
    const based = key as BaseDuration;
    newObject[based] = (newObject[based] || 0) + value;
  }
  return newObject;
};

export const addDurationObjects = (
  durationObject: ToneJSDuration,
  durations: Array<BaseDuration>
) => {
  const newObject: ToneJSDuration = { ...durationObject };
  for (let i = 0; i < durations.length; i++) {
    const based = durations[i] as BaseDuration;
    newObject[based] = (newObject[based] || 0) + 1;
  }
  return newObject;
};

export const setVolume = (volume: number) => {
  instrumentVolume = volume;
  Object.entries(availableInstruments).forEach(([index, instrument]) => {
    instrument.volume.value = volume;
    if (instrument.volume.value == -50) {
      instrument.volume.value = -5000;
    }
    if (index === "harmonium") {
      instrument.volume.value = instrument.volume.value - 8;
    }
    if (index === "clarinet") {
      instrument.volume.value = instrument.volume.value - 8;
    }
  });
};
setVolume(instrumentVolume);

export const setVibe = (vibe: string) => {
  currentVibe = vibe as Vibe;
};
setVibe(currentVibe);

const getPitches = ({ rootNote, chordType }: Chord) => {
  const pitches = [rootNote];
  if (chordType === "major") {
    pitches.push(getThird(rootNote));
    pitches.push(getFifth(rootNote));
  }
  if (chordType === "minor") {
    pitches.push(getFlatThird(rootNote));
    pitches.push(getFifth(rootNote));
  }
  if (chordType === "power") {
    pitches.push(getFifth(rootNote));
  }
  if (chordType === "diminished") {
    pitches.push(getFlatThird(rootNote));
    pitches.push(getFlatFifth(rootNote));
  }
  return pitches;
};

const pickPitch = (
  chord: Chord,
  key: Pitch,
  availableNotes: Pitch[],
  jazziness: number
) => {
  const jazzRandomiser = Math.random();
  const pitchRandomiser = Math.random();
  let pentatonicScale = [];
  let pitch = availableNotes[getAvailableNote(chord.rootNote, availableNotes)];
  if (jazzRandomiser < jazziness) {
    pentatonicScale = getMinorPentatonicScale(chord.rootNote, availableNotes);
    pitch =
      pentatonicScale[Math.floor(pitchRandomiser * pentatonicScale.length)];
  } else {
    pentatonicScale = getMajorPentatonicScale(key, availableNotes);
    pitch =
      pentatonicScale[Math.floor(pitchRandomiser * pentatonicScale.length)];
  }
  return pitch;
};

const getAndPushMelody = (
  key: Pitch,
  chord: Chord,
  currentTime: ToneJSDuration,
  chordDuration: ToneJSDuration,
  lastNote: Pitch,
  instrument: any,
  parameters: pitchLineParameters,
  availableNotes: Pitch[] = middleNotes
) => {
  let pitch = chord.rootNote;
  let lastDuration = "8n";
  if (instrument.loaded) {
    for (let i = 0; i < tonejsDurationTo16thCount(chordDuration); i++) {
      const pitchRadomiser = Math.random();
      const jazzRandomiser = Math.random();
      const skipRandomiser = Math.random();
      const jumpinessRandomiser = Math.random();

      if (
        skipRandomiser < 0.15 * parameters.skippiness &&
        lastDuration === "16n"
      ) {
        currentTime = addToneJSDurations(currentTime, { "16n": 1 });
        lastDuration = "16n";
        continue;
      }
      if (
        skipRandomiser < 0.55 * parameters.skippiness &&
        lastDuration !== "16n"
      ) {
        if (jazzRandomiser < 0.12 * parameters.skippiness) {
          currentTime = addToneJSDurations(currentTime, { "8n": 1 });
        } else if (jazzRandomiser < 0.2 * parameters.skippiness) {
          currentTime = addToneJSDurations(currentTime, { "8n.": 1 });
        } else {
          currentTime = addToneJSDurations(currentTime, { "16n": 1 });
        }
        lastDuration = "16n";
        continue;
      }
      pitch = pickPitch(chord, key, availableNotes, parameters.jazziness);
      if (
        Math.abs(
          getAvailableNote(pitch, availableNotes) -
            getAvailableNote(lastNote, availableNotes)
        ) >
        12 * parameters.jumpiness * jumpinessRandomiser
      ) {
        pitch = pickPitch(chord, key, availableNotes, parameters.jazziness);
      }
      if (
        Math.abs(
          getAvailableNote(pitch, availableNotes) -
            getAvailableNote(lastNote, availableNotes)
        ) >
          15 * parameters.jumpiness * jumpinessRandomiser &&
        parameters.jumpiness * jumpinessRandomiser > 2
      ) {
        pitch = pickPitch(chord, key, availableNotes, parameters.jazziness);
      }
      if (
        Math.abs(
          getAvailableNote(pitch, availableNotes) -
            getAvailableNote(lastNote, availableNotes)
        ) >
          15 * parameters.jumpiness * jumpinessRandomiser &&
        parameters.jumpiness * jumpinessRandomiser > 3
      ) {
        pitch = pickPitch(chord, key, availableNotes, parameters.jazziness);
      }
      let duration = "8n";
      const durationRandomiser = Math.random();
      if (durationRandomiser < 0.25 * parameters.rapidity) {
        duration = "16n";
      } else if (durationRandomiser < 0.45 * parameters.rapidity) {
        duration = "8n";
      } else if (durationRandomiser < 0.6 * parameters.rapidity) {
        duration = "8n.";
      } else if (durationRandomiser < 0.7 * parameters.rapidity) {
        duration = "4n";
      } else if (durationRandomiser < 0.8 * parameters.rapidity) {
        duration = "4n.";
      } else {
        duration = "2n";
      }
      instrument.triggerAttackRelease(pitch, duration, currentTime);
      lastDuration = duration;
      currentTime = addToneJSDurations(currentTime, { "16n": 1 });
    }
  }
  return pitch;
};

const pushChord = (
  chord: Chord,
  currentTime: ToneJSDuration,
  duration: ToneJSDuration,
  instrument: any
) => {
  if (instrument.loaded) {
    for (const pitch of getPitches(chord)) {
      instrument.triggerAttackRelease(pitch, duration, currentTime);
    }
  }
};

let isTransitioning = false;

const fadeOutThenIn = async () => {
  const fadeIncrementDb = 1.4;
  const fadeIncrementMilliseconds = 90;
  const fadeIncrements = 22;
  for (let i = 0; i < fadeIncrements; i++) {
    Object.values(availableInstruments).forEach((instrument) => {
      instrument.volume.value = instrument.volume.value - fadeIncrementDb;
    });
    await new Promise((r) => setTimeout(r, fadeIncrementMilliseconds));
  }
  Tone.start();
  Object.values(availableInstruments).forEach((instrument) => {
    instrument.releaseAll();
  });
  Tone.Transport.cancel();
  Object.values(availableInstruments).forEach((instrument) => {
    instrument.sync();
  });
  for (let i = 1; i < fadeIncrements + 1; i++) {
    setTimeout(() => {
      Object.values(availableInstruments).forEach((instrument) => {
        instrument.volume.value = instrument.volume.value + fadeIncrementDb;
      });
    }, fadeIncrementMilliseconds * i);
    if (i === 15) {
      setTimeout(
        () => (isTransitioning = false),
        (fadeIncrementMilliseconds * i) / 2
      );
    }
  }
};

const getChord = (
  key: Pitch,
  lastChord: Chord,
  parameters: pitchLineParameters
): Chord => {
  const chooseChordRandom = Math.random();

  const keyChangeRandom = Math.random();
  if (keyChangeRandom < parameters.jazziness * 0.8) {
    if (chooseChordRandom < 0.1) {
      return getPowerFourth(key);
    }
    if (chooseChordRandom < 0.2) {
      return getMajorFourth(key);
    }
    if (chooseChordRandom < 0.3) {
      return getPowerFifth(key);
    }
    if (chooseChordRandom < 0.4) {
      return getMajorFifth(key);
    }
    if (chooseChordRandom < 0.45) {
      return getDiminishedSeventh(key);
    }
    if (chooseChordRandom < 0.55) {
      return getRootPower(getFlatSecond(key));
    }
    if (chooseChordRandom < 0.65) {
      return getRootMajor(getSeventh(key));
    }
    if (chooseChordRandom < 0.75) {
      return getMajorThird(key);
    }
  }
  if (chooseChordRandom < 0.1) {
    return getRootMajor(key);
  }
  if (chooseChordRandom < 0.2) {
    return getRootPower(key);
  }
  if (chooseChordRandom < 0.23) {
    return getMinorSecond(key);
  }
  if (chooseChordRandom < 0.26) {
    return getPowerSecond(key);
  }
  if (chooseChordRandom < 0.35) {
    return getPowerThird(key);
  }
  if (chooseChordRandom < 0.4) {
    return getMinorThird(key);
  }
  if (chooseChordRandom < 0.4) {
    return getPowerFourth(key);
  }
  if (chooseChordRandom < 0.55) {
    return getMajorFourth(key);
  }
  if (chooseChordRandom < 0.65) {
    return getPowerFifth(key);
  }
  if (chooseChordRandom < 0.75) {
    return getMajorFifth(key);
  }
  if (chooseChordRandom < 0.85) {
    return getMinorSixth(key);
  }
  if (chooseChordRandom < 0.93) {
    return getPowerSixth(key);
  }
  if (chooseChordRandom < 0.95) {
    return getDiminishedSeventh(key);
  }
  if (chooseChordRandom < 0.96) {
    return getRootPower(getFlatSecond(key));
  }
  if (chooseChordRandom < 0.97) {
    return getRootMajor(getSeventh(key));
  }
  if (chooseChordRandom < 0.98) {
    return getMajorThird(key);
  }
  return getRootMajor(key);
};

const getChordLength = (index: number): ToneJSDuration => {
  const random = Math.random();

  if (random < 0.4) {
    return {
      "1n": 1,
    };
  }
  if (random < 0.6) {
    return {
      "2n": 1,
    };
  }
  if (random < 0.75) {
    return {
      "1n.": 1,
    };
  }
  if (random < 0.85) {
    return {
      "4n": 1,
    };
  }
  if (random < 0.9) {
    return {
      "2n.": 1,
    };
  }
  return {
    "1n": 2,
  };
};

const getKey = (key: Pitch, currentChord: Chord) => {
  const random = Math.random();
  if (includesChord(getNormalChords(key), currentChord)) {
    if (isSameModuloOctave(getFifth(key), currentChord.rootNote)) {
      if (random < 0.2) {
        return currentChord.rootNote;
      }
    }
    if (isSameModuloOctave(getFourth(key), currentChord.rootNote)) {
      if (random < 0.1) {
        return currentChord.rootNote;
      }
    }
    return key;
  }
  if (currentChord.chordType === "major") {
    if (random < 0.5) {
      return getFourth(currentChord.rootNote, bassNotes);
    }
    if (random < 0.7) {
      return currentChord.rootNote;
    }
  }
  return key;
};

export const startNewSong = async () => {
  Tone.Transport.bpm.value = getBPM(currentVibe);
  Tone.Transport.position = "0:0:0";
  if (!isTransitioning) {
    isTransitioning = true;
    
    await fadeOutThenIn();
    let currentTime: ToneJSDuration = { "8n": 1 };

    let key: Pitch = "E2";
    let lastChord: Chord = {
      rootNote: "E2",
      chordType: "major",
    };
    let lastMelodyNote: Pitch = "B4";
    let lastMelodyNote2: Pitch = "B4";
    let lastMelodyNote3: Pitch = "B4";
    let lastCounterMelodyNote: Pitch = "E2";
    let lastCounterMelodyNote2: Pitch = "E2";
    let lastCounterMelodyNote3: Pitch = "E2";
    let i: number = 0;

    let melodyParameters = getInitialMelodyParameters(currentVibe);
    let countermelodyParameters =
      getInitialCountermelodyParameters(currentVibe);
    const bandInstruments = getInstruments(currentVibe, availableInstruments);
    while (i < 100) {
      const currentChord = getChord(key, lastChord, countermelodyParameters);
      const chordDuration = getChordLength(i);
      key = getKey(key, currentChord);
      if (bandInstruments.playChordsInstrument) {
        pushChord(
          currentChord,
          currentTime,
          chordDuration,
          bandInstruments.chordsInstrument
        );
      }
      if (bandInstruments.playMelodyInstrument) {
        lastMelodyNote = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastMelodyNote,
          bandInstruments.melodyInstrument,
          melodyParameters
        );
        lastMelodyNote2 = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastMelodyNote2,
          bandInstruments.melodyInstrument,
          melodyParameters
        );
        lastMelodyNote3 = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastMelodyNote3,
          bandInstruments.melodyInstrument,
          melodyParameters
        );
      }
      if (bandInstruments.playCountermelodyInstrument) {
        lastCounterMelodyNote = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastCounterMelodyNote,
          bandInstruments.countermelodyInstrument,
          countermelodyParameters,
          bassNotes
        );
        lastCounterMelodyNote2 = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastCounterMelodyNote2,
          bandInstruments.countermelodyInstrument,
          countermelodyParameters,
          bassNotes
        );
        lastCounterMelodyNote3 = getAndPushMelody(
          key,
          currentChord,
          currentTime,
          chordDuration,
          lastCounterMelodyNote3,
          bandInstruments.countermelodyInstrument,
          countermelodyParameters,
          bassNotes
        );
      }
      currentTime = addToneJSDurations(currentTime, chordDuration);
      lastChord = currentChord;
      melodyParameters = incrementParameters(melodyParameters, currentVibe);
      countermelodyParameters = incrementParameters(
        countermelodyParameters,
        currentVibe
      );
      i++;
    }

    Tone.Transport.start();
  }
};
