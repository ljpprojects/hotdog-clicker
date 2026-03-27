/*
_  _                _      _         _
| |(_)  __ _  _   _ (_)  __| |  __ _ | |_  ___
| || | / _` || | | || | / _` | / _` || __|/ _ \
| || || (_| || |_| || || (_| || (_| || |_|  __/
|_||_| \__, | \__,_||_| \__,_| \__,_| \__|\___|
          |_|
*/

import { GeneralBinding } from "../Binding";
import {
  bjDealButton,
  bjDealAgainButton,
} from "./elements";
import {
  playBlackjackButton,
  spinSlotsButton,
  openGamblingButton,
  playKenoButton
} from "../elements";
import { wait } from "../utils";

document.addEventListener("mousemove", (e) => {
  mouse = [e.clientX, e.clientY];

  console.log(mouse)
});

const targets = [
  playBlackjackButton,
  spinSlotsButton,
  openGamblingButton,
  playKenoButton,
  bjDealButton,
  bjDealAgainButton
];

/**
 * Returns a distance to retreat relative to the length of the viewport's diagonal.
 *
 * @param d The distance between the cursor and some other point, relative to the length of the viewport diagonal.
 *
 * @returns The relative distance to retreat.
 */
const runSpeedCurve = (d: number) => 0.2 - d;

type Point = [number, number];

// The light of the new day will help

const distance = (p1: Point, p2: Point): number =>
  Math.hypot(Math.abs(p1[0] - p2[0]), Math.abs(p1[1] - p2[1])); // nifty!

let VIEWPORT_DIAGONAL = distance(
  [0, 0],
  [window.innerWidth, window.innerHeight],
);

window.addEventListener("resize", () => {
  VIEWPORT_DIAGONAL = distance([0, 0], [window.innerWidth, window.innerHeight]);
});

type Vector = {
  magnitude: number;
  directionRadians: number;
};

/**
 * Equivalent to vector component notation.
 * @param xComponent The x component of the vector
 * @param yComponent The y component
 * @returns A position vector whose magnitude and direction are calculated from the two given components (magnitude will be relative to the length of the viewport's diagonal)
 */
const componentVector = (xComponent: number, yComponent: number): Vector => ({
  magnitude: distance([0, 0], [xComponent, yComponent]) / VIEWPORT_DIAGONAL,
  directionRadians: Math.atan2(yComponent, xComponent),
});

const velocityVector = (speed: number, directionRadians: number) => ({
  magnitude: speed,
  directionRadians: directionRadians,
});

const findXComponent = (v: Vector) =>
  v.magnitude * Math.cos(v.directionRadians);

const findYComponent = (v: Vector) =>
  v.magnitude * Math.sin(v.directionRadians);

// We need to make the cancel button run away.
// A vector with the origin as the cursor and the tail at the centre of the button will be used to calculate (using the curve) how fast the button should run away

// (assuming v is the final velocity, u is the starting velocity, a is the
// acceleration vector, and d is the displacement vector)
//
// We need to treat the x and y axis separately (vx is the horizontal speed, vy
// the vertical speed)
//
// vx = v cos θ
// vy = v sin θ
//
// (sx = x displacement, sy = y displacement, ux = x speed, uy = y speed)
//
// sx = ux · t + 1/2 · a · t^2
// sy = uy · t + 1/2 · a · t^2
//
// (combine deceleration with clamped delta-times)
//
// And therefore we can make a displacement vector out of this (x = start x, y = start y)
//
// v⃗ =〈sx - x, sy - y〉

const buttonCentre = (target: HTMLElement): Point => {
  let boundingRect = target.getBoundingClientRect();

  const xCentre = boundingRect.left + boundingRect.width / 2;
  const yCentre = boundingRect.top + boundingRect.height / 2;

  return [xCentre, yCentre];
};

/**
 *
 * @param position The position vector from the cursor to the button's centre
 */
const moveButton = (
  position: Vector,
  t: number,
  target: HTMLElement,
  angleOffsetRadians: number = 0,
) => {
  // Now we can get a velocity vector using the curve
  let velocity = velocityVector(
    runSpeedCurve(position.magnitude) * VIEWPORT_DIAGONAL, // px/s
    position.directionRadians * Math.random() * (1 + Math.random()) +
    angleOffsetRadians,
  );

  const vx = findXComponent(velocity);
  const vy = findYComponent(velocity);

  const a = -VIEWPORT_DIAGONAL; // px/s^2

  // Using the second kinematic equation, find the displacement for each axis
  const sx = vx * t + (1 / 2) * a * Math.pow(t, 2);
  const sy = vy * t + (1 / 2) * a * Math.pow(t, 2);

  // Get current button left and right (in px)
  const tx = Number(target.style.left.slice(0, -2));
  const ty = Number(target.style.top.slice(0, -2));

  target.style.left = `${tx + sx}px`;
  target.style.top = `${ty + sy}px`;
};

let mouse: Point = [0, 0];

let lastTime = performance.now();
requestAnimationFrame(function kill(now) {
  const buttonCentres = targets.map(buttonCentre);
  const positions = buttonCentres.map(([x, y]) =>
    componentVector(x - mouse[0], y - mouse[1]),
  );

  const delta = now - lastTime;
  lastTime = now;

  for (const [i, target] of targets.entries()) {
    moveButton(positions[i], Math.min(1 / 60, delta / 1000), target);
  }

  requestAnimationFrame(kill);
});
