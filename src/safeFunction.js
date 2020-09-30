import { safeStringifyFunction } from './utilities';

function buildSafeFunction(unsafeRec, safeFunctionOperation) {
  const { callAndWrapError, unsafeFunction } = unsafeRec;

  const { defineProperties } = Object;

  const safeFunction = function Function() {
    return callAndWrapError(safeFunctionOperation, arguments);
  };

  // Ensure that Function from any compartment in a root realm can be used
  // with instance checks in any compartment of the same root realm.

  defineProperties(safeFunction, {
    // Ensure that any function created in any compartment in a root realm is an
    // instance of Function in any compartment of the same root realm.
    // FIXME: This should be `writable: false` to match the native function constructor.
    prototype: { value: unsafeFunction.prototype },

    // Provide a custom output without overwriting the
    // Function.prototype.toString which is called by some third-party
    // libraries.
    toString: {
      value: () => 'function Function() { [shim code] }',
      writable: false,
      enumerable: false,
      configurable: true
    }
  });

  return safeFunction;
}
export const buildSafeFunctionString = safeStringifyFunction(buildSafeFunction);
