import Vector from './vectors';

/**
 * Collapses bubbles towards their center of mass based on their area.
 * @param areas - Array of bubble areas
 * @param spacing - Minimal spacing between bubbles
 * @param nIterations - Number of simulation steps
 * @returns An object containing the final X, Y, and Radius vectors
 */
function computeBubblePositions(areas: number[], spacing = 0, nIterations = 50) {
  const n = areas.length;

  // 1. Initialize Vectors
  const areaVec = new Vector(n);
  areaVec.values.set(areas);

  const rVec = areaVec.scale(1 / Math.PI).sqrt();
  const xVec = new Vector(n);
  const yVec = new Vector(n);
  const com = new Vector(2);

  // 2. Initial Grid Layout
  const maxRadius = rVec.max();
  const maxStep = 2 * maxRadius + spacing;
  let stepDist = maxStep / 2;
  const sideLength = Math.ceil(Math.sqrt(n));

  for (let i = 0; i < n; i++) {
    xVec.values[i] = (i % sideLength) * maxStep;
    yVec.values[i] = Math.floor(i / sideLength) * maxStep;
  }

  // Helper to update Center of Mass
  const updateCOM = () => {
    com.values[0] = xVec.average(areaVec);
    com.values[1] = yVec.average(areaVec);
  };

  // Helper for outline distances using Vector.hypot
  const getOutlineDistances = (targetIdx: number, testX: number, testY: number): Vector => {
    const dx = xVec.scale(-1).applyUnaryOperator((v) => v + testX);
    const dy = yVec.scale(-1).applyUnaryOperator((v) => v + testY);
    const centerDistances = dx.hypot(dy);
    const targetR = rVec.get(targetIdx);

    return centerDistances.applyUnaryOperator((d) => d - targetR - spacing).subtract(rVec);
  };

  updateCOM();

  // 3. Simulation Loop
  for (let it = 0; it < nIterations; it++) {
    let moves = 0;

    for (let i = 0; i < n; i++) {
      const curX = xVec.get(i);
      const curY = yVec.get(i);

      const dirX = com.get(0) - curX;
      const dirY = com.get(1) - curY;
      const mag = Math.hypot(dirX, dirY);

      if (mag === 0) {
        continue;
      }

      // Try move to COM
      const nextX = curX + (dirX / mag) * stepDist;
      const nextY = curY + (dirY / mag) * stepDist;

      const distances = getOutlineDistances(i, nextX, nextY);

      // Check collisions (ignoring self)
      let collided = false;
      for (let j = 0; j < n; j++) {
        if (i !== j && distances.get(j) < 0) {
          collided = true;
          break;
        }
      }

      if (!collided) {
        xVec.values[i] = nextX;
        yVec.values[i] = nextY;
        updateCOM();
        moves++;
      } else {
        // Slide logic: find closest collider
        let minVal = Infinity;
        let collIdx = -1;
        for (let j = 0; j < n; j++) {
          if (i !== j && distances.get(j) < minVal) {
            minVal = distances.get(j);
            collIdx = j;
          }
        }

        const diffX = xVec.get(collIdx) - curX;
        const diffY = yVec.get(collIdx) - curY;
        const diffMag = Math.hypot(diffX, diffY);

        // Orthogonal trials
        const ox = (diffY / diffMag) * stepDist;
        const oy = (diffX / diffMag) * stepDist;

        const p1x = curX + ox;
        const p1y = curY - oy;
        const p2x = curX - ox;
        const p2y = curY + oy;

        const d1 = Math.hypot(p1x - com.get(0), p1y - com.get(1));
        const d2 = Math.hypot(p2x - com.get(0), p2y - com.get(1));

        const [bestX, bestY] = d1 < d2 ? [p1x, p1y] : [p2x, p2y];

        const slideDists = getOutlineDistances(i, bestX, bestY);
        let slideCollided = false;
        for (let j = 0; j < n; j++) {
          if (i !== j && slideDists.get(j) < 0) {
            slideCollided = true;
            break;
          }
        }

        if (!slideCollided) {
          xVec.values[i] = bestX;
          yVec.values[i] = bestY;
          updateCOM();
        }
      }
    }

    if (moves / n < 0.1) {
      stepDist /= 2;
    }
  }

  return { x: xVec.subtract(xVec.mean()), y: yVec.subtract(yVec.mean()), r: rVec };
}

export default computeBubblePositions;
