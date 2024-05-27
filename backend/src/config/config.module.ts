import { ConfigModule } from '@nestjs/config';

export const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.${process.env.NODE_ENV}.env`,
    ignoreEnvVars: true,
    validate: (config) => {
        return Object.keys(config).map((key) => {
            return process.env[key] ?? config[key];
        });
    },
});
