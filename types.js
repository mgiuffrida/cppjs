'use strict';

class Type {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }

  toString() {
    return this.name;
  }
}

class VoidType extends Type {
  constructor() {
    super('void', 0);
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
}

class IntegralType extends Type {
  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   */
  constructor(name, size) {
    super(name, size);
  }

  // TODO: Specializations for different sizes and signedness.
  // TODO: Range validation and type detection.
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

// Closure typedefs.
/** @typedef {Type} */ module.exports.Type;
/** @typedef {VoidType} */ module.exports.VoidType;
/** @typedef {BooleanType} */ module.exports.BooleanType;
/** @typedef {IntegralType} */ module.exports.IntegralType;
