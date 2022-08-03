import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidTokenException extends HttpException {
    constructor() {
        super('Invalid Token', HttpStatus.FORBIDDEN)
    }
}