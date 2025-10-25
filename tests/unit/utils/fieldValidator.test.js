const fieldValidator = require('../../../util/fieldValidator');
const { VALIDATE } = require('../../../common/messages');

describe('Field Validator', () => {
  describe('validate_string', () => {
    it('should return 1 for a valid string', async () => {
      const result = await fieldValidator.validate_string('John Doe', 'name');
      expect(result).toBe(1);
    });

    it('should return an error object for empty string', async () => {
      const result = await fieldValidator.validate_string('', 'name');
      expect(result).toEqual({
        fields: 'name',
        message: VALIDATE.PARAM.EMPTY('name'),
      });
    });

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

  describe('validate_number', () => {
    it('should return 1 for a valid number', async () => {
      const result = await fieldValidator.validate_number(42, 'age');
      expect(result).toBe(1);
    });

    it('should return an error object for NaN', async () => {
      const result = await fieldValidator.validate_number('john', 'age');
      expect(result).toEqual({
        fields: 'age',
        message: VALIDATE.PARAM.EMPTY('age'),
      });
    });
  });

  describe('validate_boolean', () => {
    it('should return 1 for true or false', async () => {
      expect(await fieldValidator.validate_boolean(true, 'isActive')).toBe(1);
      expect(await fieldValidator.validate_boolean(false, 'isActive')).toBe(1);
    });

    it('should return an error object for non-boolean', async () => {
      const result = await fieldValidator.validate_boolean('true', 'isActive');
      expect(result).toEqual({
        fields: 'isActive',
        message: VALIDATE.PARAM.INVALID('isActive'),
      });
    });
  });
});
