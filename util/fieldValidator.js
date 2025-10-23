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
};

module.exports = fieldValidator;
