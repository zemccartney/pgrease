'use strict';

exports.nameError = (name) => {
  return (message) => {
    const e = new Error(message);
    e.name = name;
    return e;
  };
};
