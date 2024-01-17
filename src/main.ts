import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const configService = app.get(ConfigService);
  swagger(app);

  await app.listen(configService.get('PORT'));
  console.log(`Environment: ${configService.get<string>('ENVIRONMENT')}`);
}

function swagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Lerni')
    .setDescription('The Lerni API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}

bootstrap();
