export interface AppError extends Error {
    statusCode: number;
}

export class internalServerError extends Error implements AppError {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = 500;
        this.name = "InternalServerError";
    }
}

export class badRequest extends Error implements AppError {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = 400;
        this.name = "BadRequest";
    }
}

export class notFound extends Error implements AppError {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = 404;
        this.name = "NotFound";
    }
}

export class unauthorized extends Error implements AppError {
    statusCode: number;

    constructor(message: string = "Unauthorized") {
        super(message);
        this.statusCode = 401;
        this.name = "Unauthorized";
    }
}
