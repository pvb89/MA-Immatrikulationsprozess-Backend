// import {APIError, NotFoundException, ServerException, BadRequestException} from '../services/ResponseService';

  const middleware = {
    handleRequestError(error: any, req: any, res: any, next: any) {
      switch (true) {
        // case (error instanceof APIError):
        case (error.name === "APIError"):
          res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message + " - errorHandler",
          });
          break;
        case (error.name === "ServerException"):
          res.status(500).json({
            success: false,
            error: 'Internal server error - ServerException - errorHandler',
            statusCode: 500
          });
          break;
      }
      res.end();
    },
  };
  
  export { middleware };
