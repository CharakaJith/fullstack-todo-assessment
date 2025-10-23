module.exports = {
  APP_ENV: Object.freeze({
    DEV: 'development',
    QA: 'qa',
    STAGE: 'staging',
    PROD: 'production',
  }),

  STATUS_CODE: Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDON: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    UNPORCESSABLE: 422,

    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    TIME_OUT: 504,
  }),

  CONNECTION: Object.freeze({
    ABORT: 'ECONNABORTED',
    NOTFOUND: 'ENOTFOUND',
    REFUSED: 'ECONNREFUSED',
  }),
};
