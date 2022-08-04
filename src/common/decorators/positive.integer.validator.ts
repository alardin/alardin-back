import { buildMessage, isInt, isPositive, registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsPositiveInt(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPositiveInt',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if(isInt(value) && isPositive(value)) {
                        return true;
                    }
                    return false;
                },
                defaultMessage: buildMessage(
                    eachPrefix => `${eachPrefix} must be positive integer!`, 
                    validationOptions
                )
            }
        })
    }

}