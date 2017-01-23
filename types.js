'use strict';

class Type {
  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   */
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }

  /** @override */
  toString() {
    return this.name;
  }

  /** @return {!Function} */
  getArrayType() {
    return Uint8Array;
  }

  /**
   * @param {number|boolean} value
   * @return {!TypedArray}
   */
  toBytes(value) {
    let arrayType = this.getArrayType();
    // Creates a buffer of size 1 * arrayType.BYTES_PER_ELEMENT.
    let typedArray = new arrayType(1);
    typedArray[0] = value;
    return typedArray;
  }
}

class VoidType extends Type {
  constructor() {
    super('void', 0);
  }

  /** @override */
  toBytes(value) {
    throw new Error('VoidType cannot have a value');
  }
}

class BooleanType extends Type {
  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   */
  constructor(name, size) {
    super(name, size);
  }

  /** @override */
  getArrayType() {
    return Uint8Array;
  }

  toBytes(value) {
    if (typeof value != 'boolean')
      throw new Error('Cannot convert type ' + typeof value + ' to Boolean');
    return super.toBytes(value);
  }
}

class IntegralType extends Type {
  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   * TODO: signed integers.
   */
  constructor(name, size) {
    super(name, size);
  }

  /** @override */
  getArrayType() {
    switch (this.size) {
      case 1:
        return Uint8Array;
      case 2:
        return Uint16Array;
      case 4:
        return Uint32Array;
      default:
        throw new Error(`Unsupported size: ${this.size}`);
    }
  }

  toBytes(value) {
    let maxValue = Math.pow(2, 8 * this.size) - 1;
    if (value > maxValue) {
      throw new Error(
          `Cannot convert ${value} to integer (max value ${maxValue})`);
    }
    return super.toBytes(value);
  }
}

VoidType.VOID = new VoidType;
BooleanType.BOOL = new BooleanType('bool', 1);
IntegralType.CHAR = new IntegralType('char', 1);
IntegralType.CHAR16_T = new IntegralType('char16_t', 2);
IntegralType.CHAR32_T = new IntegralType('char32_t', 4);
IntegralType.INT = new IntegralType('int', 4);
IntegralType.SHORT = new IntegralType('short', 2);
IntegralType.LONG = new IntegralType('long', 4);
IntegralType.LONG_LONG = new IntegralType('long long', 8);

module.exports = {
  Type: Type,
  VoidType: VoidType,
  BooleanType: BooleanType,
  IntegralType: IntegralType,
};
