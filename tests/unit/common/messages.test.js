const MESSAGES = require('../../../common/messages');

describe('Messages', () => {
  // cors
  it('should return correct CORS message', () => {
    expect(MESSAGES.CORS.INVALID).toBe('Not allowed by CORS!');
  });

  // database initialization
  it('should return correct DATABASE messages', () => {
    const error = new Error('DB error');

    expect(MESSAGES.DATABASE.CONNECTION.SUCCESS).toBe('Connection has been established successfully.');
    expect(MESSAGES.DATABASE.CONNECTION.FAILED(error)).toBe('Unable to connect to the database: DB error');
  });

  // field validation
  it('should return correct validation messages', () => {
    expect(MESSAGES.VALIDATE.PARAM.EMPTY('title')).toBe("The 'title' field is required.");
    expect(MESSAGES.VALIDATE.PARAM.INVALID('title')).toBe("Invalid format for 'title'.");
  });

  // response payload
  it('should return correct RESPONSE messages', () => {
    expect(MESSAGES.RESPONSE.TASK.NOT_FOUND).toBe('Invalid task ID');
    expect(MESSAGES.RESPONSE.TASK.UPDATE_FAILED).toBe('Failed to update the task');
  });

  // repository layer errors
  it('should return correct REPO error messages', () => {
    const error = new Error('some error');

    expect(MESSAGES.REPO.FAILED.INSERT('Task', error)).toBe('Failed to create Task: some error');
    expect(MESSAGES.REPO.FAILED.GET.All('Task', error)).toBe('Failed to get all Task: some error');
    expect(MESSAGES.REPO.FAILED.GET.BY_ID('Task', error)).toBe('Failed to retrieve Task by ID: some error');
    expect(MESSAGES.REPO.FAILED.UPDATE('Task', error)).toBe('Failed to update Task: some error');
  });
});
