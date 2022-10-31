import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
const dataSource = new DataSource({
    type: 'mysql',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: +process.env.DB_PORT,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    entities: ['dist/**/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*.ts'],
    logging: process.env.NODE_ENV === 'DEV' ? true : false,
    synchronize: false
});

export default dataSource;