// ====Types====

global.provide && provide('types');

module.exports = function() {
  class Type {
    constructor(name, size) {
      this.name = name;
      this.size = size;
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
  IntegralType.INT = new IntegralType('int', 4);
  IntegralType.SHORT = new IntegralType('short', 2);
  IntegralType.LONG = new IntegralType('long', 4);
  IntegralType.LONG_LONG = new IntegralType('long long', 8);

  return {
    Type: Type,
    VoidType: VoidType,
    BooleanType: BooleanType,
    IntegralType: IntegralType,
  };
}();
