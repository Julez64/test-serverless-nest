import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountersModule } from './counters/counters.module';

@Module({
  imports: [CountersModule, CountersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
