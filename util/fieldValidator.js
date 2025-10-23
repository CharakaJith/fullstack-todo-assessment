const { VALIDATE } = require('../common/messages');

const fieldValidator = {
  validate_string: async (value, param) => {
    if (!value || value.trim().length === 0) {
      return {
        fields: param,
        message: VALIDATE.PARAM.EMPTY(param),
      };
    }

    return 1;
  },

  validate_number: async (value, param) => {
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return {
        fields: param,
        message: VALIDATE.PARAM.EMPTY(param),
      };
    }

    return 1;
  },

  validate_boolean: async (value, param) => {
    if (typeof value !== 'boolean') {
      return {
        fields: param,
        message: VALIDATE.PARAM.INVALID(param),
      };
    }

    return 1;
  },
};

module.exports = fieldValidator;
