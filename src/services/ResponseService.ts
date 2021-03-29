class APIError extends Error {
    public ErrorID: any;
    public code: any;
    constructor(message: string) {
      super();
      Error.captureStackTrace(this, this.constructor);
      this.name = 'APIError';
      this.message = message;
    }
  }

class ServerException extends Error {
  constructor(message: string) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ServerException';
    this.message = message;
  }
}

const NotFoundException = class NotFoundException extends Error { };
const BadRequestException = class BadRequestException extends Error { };
// const ServerException = class ServerException extends Error { };

export { BadRequestException, NotFoundException, ServerException, APIError };
