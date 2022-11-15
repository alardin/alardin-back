import { SetMetadata } from '@nestjs/common';

export const ForRoles = (roles: string[]) => SetMetadata('roles', roles);
