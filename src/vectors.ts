type UnaryOperator<T> = (a: T) => T;
type BinaryOperator<T> = (a: T, b: T) => T;

class Vector {
  public values: Float32Array;

  constructor(public size: number) {
    this.values = new Float32Array(size);
  }

  public get(index: number): number {
    return this.values[index];
  }

  public applyUnaryOperator(operator: UnaryOperator<number>): Vector {
    const result = new Vector(this.size);
    for (let i = 0; i < this.size; i++) {
      result.values[i] = operator(this.values[i]);
    }
    return result;
  }

  public applyBinaryOperator(other: Vector, operator: BinaryOperator<number>): Vector {
    if (this.size !== other.size) {
      throw new Error('Vectors must be of the same size');
    }
    const result = new Vector(this.size);
    for (let i = 0; i < this.size; i++) {
      result.values[i] = operator(this.values[i], other.values[i]);
    }
    return result;
  }

  private reduce(operator: BinaryOperator<number>): number {
    let result = this.values[0];
    for (let i = 1; i < this.size; i++) {
      result = operator(result, this.values[i]);
    }
    return result;
  }

  public length(): number {
    return this.values.length;
  }

  public add(other: number): Vector;
  public add(other: Vector): Vector;
  public add(other: Vector | number): Vector {
    if (typeof other === 'number') {
      return this.applyUnaryOperator((a) => a + other);
    } else {
      return this.applyBinaryOperator(other, (a, b) => a + b);
    }
  }

  public subtract(scalar: number): Vector;
  public subtract(other: Vector): Vector;
  public subtract(other: Vector | number): Vector {
    if (typeof other === 'number') {
      return this.applyUnaryOperator((a) => a - other);
    } else {
      return this.applyBinaryOperator(other, (a, b) => a - b);
    }
  }

  public scale(scalar: number): Vector {
    return this.applyUnaryOperator((a) => a * scalar);
  }

  public multiply(other: Vector): Vector {
    return this.applyBinaryOperator(other, (a, b) => a * b);
  }

  public min(): number {
    return this.reduce((a, b) => Math.min(a, b));
  }

  public max(): number {
    return this.reduce((a, b) => Math.max(a, b));
  }

  public sqrt(): Vector {
    return this.applyUnaryOperator((a) => Math.sqrt(a));
  }

  public ceil(): Vector {
    return this.applyUnaryOperator((a) => Math.ceil(a));
  }

  public sum(): number {
    return this.reduce((a, b) => a + b);
  }

  public mean(): number {
    return this.sum() / this.size;
  }

  public average(weights: Vector): number {
    if (this.size !== weights.size) {
      throw new Error('Vectors must be of the same size');
    }
    const weightedSum = this.applyBinaryOperator(weights, (a, b) => a * b).sum();
    const totalWeight = weights.sum();
    return weightedSum / totalWeight;
  }

  public dot(other: Vector): number {
    if (this.size !== other.size) {
      throw new Error('Vectors must be of the same size');
    }
    let result = 0;
    for (let i = 0; i < this.size; i++) {
      result += this.values[i] * other.values[i];
    }
    return result;
  }

  public hypot(other: Vector): Vector {
    return this.applyBinaryOperator(other, (a, b) => Math.hypot(a, b));
  }
}

export default Vector;
