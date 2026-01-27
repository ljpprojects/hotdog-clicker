/*
_  _                _      _         _
| |(_)  __ _  _   _ (_)  __| |  __ _ | |_  ___
| || | / _` || | | || | / _` | / _` || __|/ _ \
| || || (_| || |_| || || (_| || (_| || |_|  __/
|_||_| \__, | \__,_||_| \__,_| \__,_| \__|\___|
          |_|
*/

import { equal } from "./utils";

// Make the cancel button run away but we bait and swictht eh player by disabling and making transparent the original button while creating a cloen at the mirror position which can freely run away and to stop them from clicking it delete it if the curve returns > 90

/**
 * Returns a distance to retreat relative to the distance of the segment of the line passing between the points which the nearest edge of the button and cursor are, within the bounds of the viewport, based on how the given distance.
 *
 * @param d The distance between the closest edge of the button and the cursor relative to the distance of the segment of the line passing between those points within the bounds of the viewport.
 *
 * @returns The relative distance to retreat.
 */
const runDistanceCurve = (d: number) => (100 - 11 * Math.sqrt(100 * d)) / 100;

export type Point = [number, number];

const slope = (p1: Point, p2: Point) => (p2[1] - p1[1]) / (p2[0] - p1[0]);

/**
 * Compute either the vw-intercept (the point at which the line meets with the rightmost boundary of the viewport), the 0h-intercept (the point at which the line and the uppermost bound of the viewport meet) or the vh-intercept (the point at which the line and lowermost bound of the viewport meet).
 *
 * If the returned point isnt the vw-intercept (e.g y == 0 || y == vh), it is the closest point within the bounds of the viewport to it.
 * @param p1 The first point
 * @param p2 The second point
 */
const computeVwIntercept = (p1: Point, p2: Point) => {
  // If slope won't work, don't compute it; return vh-intercept
  if (p1[0] === p2[0]) {
    return [p1[0], window.innerHeight];
  }

  const m = slope(p1, p2);

  // 0h-intercept
  let i1: Point | null = null;
  if (m !== 0) {
    // Equivalent to p1[1] !== p2[1]
    i1 = [p1[0] - p1[1] / m, 0];
  }

  // vh-intercept
  let i2: Point | null = null;
  if (m !== 0) {
    i2 = [(window.innerHeight - p1[1]) / m + p1[0], window.innerHeight];
  }

  // vw-intercept
  let i2b: Point = [window.innerWidth, m * (window.innerWidth - p1[0]) + p1[1]];

  if (i1 == null && i2 == null) {
    // We are only able to return this, but it is guaranteed to be valid
    return i2b;
  }

  if (i2b[1] < 0) {
    // Return the 0h-intercept as it will be closest
    return i2;
  }

  if (i2b[1] > window.innerHeight) {
    // Return the vh-intercept as it will be closest
    return i2;
  }

  throw `This isnt possible? p1 = ${p1}, p2 = ${p2}, slope = ${slope}`;
};

/**
 * Compute either the vh-intercept (the point at which the line meets with the lowermost boundary of the viewport), or the 0w-intercept.
 *
 * If the returned point isnt the vh-intercept (i.e. y != vh), it is the closest point within the bounds of the viewport to it.
 * @param p1 The first point
 * @param p2 The second point
 */
const computeVhIntercept = (p1: Point, p2: Point) => {
  // If slope won't work, don't compute it; return vh-intercept
  if (p1[0] === p2[0]) {
    return [p1[0], window.innerHeight];
  }

  const m = slope(p1, p2);

  // 0w-intercept
  let i1b: Point = [0, m * -p1[0] + p1[1]];

  // vh-intercept
  let i2: Point | null = null;
  if (m !== 0) {
    i2 = [(window.innerHeight - p1[1]) / m + p1[0], window.innerHeight];
  }

  if (i2 == null) {
    // We are only able to return this, but it is guaranteed to be valid
    return i1b;
  }

  if (i2[0] > window.innerWidth) {
    return i1b;
  }

  // if the vw intercept point and i2 are the same, return i1b so we can still
  // just get the difference with no manual handling
  if (equal(computeVwIntercept(p1, p2), i2)) {
    return i1b;
  }

  return i2;
};

// god now we can actually
// it is 01:00 i am sick of ts
