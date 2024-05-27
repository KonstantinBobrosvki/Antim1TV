import { TypeOrmModule } from '@nestjs/typeorm';

export const DatabaseModule = TypeOrmModule.forRoot({
    type: 'postgres',
    name: 'default',
    ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
              host: process.env.DATABASE_HOST,
              port: +process.env.DATABASE_PORT,
              username: process.env.DATABASE_USER,
              password: process.env.DATABASE_PASSWORD,
              database: process.env.DATABASE_NAME,
          }),
    synchronize: true,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV == 'DEV',
    ssl: !process.env.DATABASE_URL
        ? false
        : {
              rejectUnauthorized: false,
          },
});
