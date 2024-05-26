import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();
    const config = new DocumentBuilder()
        .setTitle('Antim 1 tv api')
        .setDescription('Antim 1 tv api')
        .setVersion('1.0')
        .addTag('antim1tv')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT);
    console.log(`Application is running on: ${await app.getUrl()} port ${process.env.PORT}`);
}
bootstrap();
