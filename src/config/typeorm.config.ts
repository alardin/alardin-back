import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [join(__dirname + '../entites/**/*.entity.ts')],
    logging: true,
    synchronize: false,
    migrations: [process.env.NODE_ENV === 'prod' ? join(__dirname, '../../dist/migrations/*{.ts,.js}') 
                    : join(__dirname, '../migrations/*{.ts,.js}')],
    migrationsTableName: 'migrations',
}