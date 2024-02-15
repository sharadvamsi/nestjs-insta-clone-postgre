import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Posts } from './post.entity';
import { User } from './user.entity';
import { PostService } from './post.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Posts,User]),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(configService:ConfigService) =>({
        type:'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database:configService.get('DB_NAME'),
      entities: [Posts,User],
      synchronize: true,
    }),
  })
    
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, PostService],
})
export class AppModule {}
