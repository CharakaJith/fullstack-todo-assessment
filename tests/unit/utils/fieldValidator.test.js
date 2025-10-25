const fieldValidator = require('../../../util/fieldValidator');
const { VALIDATE } = require('../../../common/messages');

describe('Field Validator', () => {
  // validate a string
  describe('validate_string', () => {
    // valid string
    it('should return 1 for a valid string', async () => {
      const result = await fieldValidator.validate_string('John Doe', 'name');
      expect(result).toBe(1);
    });

    // empty string
    it('should return an error object for empty string', async () => {
      const result = await fieldValidator.validate_string('', 'name');
      expect(result).toEqual({
        fields: 'name',
        message: VALIDATE.PARAM.EMPTY('name'),
      });
    });

    // null or undefined
    it('should return an error object for null or undefined', async () => {
      let result = await fieldValidator.validate_string(null, 'name');
      expect(result).toEqual({
        fields: 'name',
        message: VALIDATE.PARAM.EMPTY('name'),
      });

      result = await fieldValidator.validate_string(undefined, 'name');
      expect(result).toEqual({
        fields: 'name',
        message: VALIDATE.PARAM.EMPTY('name'),
      });
    });
  });

  // validate a number
  describe('validate_number', () => {
    // valid number
    it('should return 1 for a valid number', async () => {
      const result = await fieldValidator.validate_number(42, 'age');
      expect(result).toBe(1);
    });

    // not a number
    it('should return an error object for NaN', async () => {
      const result = await fieldValidator.validate_number('john', 'age');
      expect(result).toEqual({
        fields: 'age',
        message: VALIDATE.PARAM.EMPTY('age'),
      });
    });
  });

  // validate a boolean
  describe('validate_boolean', () => {
    // valid boolean
    it('should return 1 for true or false', async () => {
      expect(await fieldValidator.validate_boolean(true, 'isActive')).toBe(1);
      expect(await fieldValidator.validate_boolean(false, 'isActive')).toBe(1);
    });

    // any other data type
    it('should return an error object for non-boolean', async () => {
      const result = await fieldValidator.validate_boolean('true', 'isActive');
      expect(result).toEqual({
        fields: 'isActive',
        message: VALIDATE.PARAM.INVALID('isActive'),
      });
    });
  });
});
