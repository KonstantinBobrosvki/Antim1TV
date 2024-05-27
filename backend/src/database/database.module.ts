import { TypeOrmModule } from '@nestjs/typeorm';

console.log(process.env);

export const DatabaseModule = TypeOrmModule.forRoot({
    type: 'postgres',
    name: 'default',
    ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
              host: process.env.DB_HOST,
              port: +process.env.DB_PORT,
              username: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
          }),
    synchronize: true,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV == 'dev',
    ssl: !process.env.DATABASE_URL
        ? false
        : {
              rejectUnauthorized: false,
          },
});
