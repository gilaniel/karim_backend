// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivitiesModule } from "./activities/activities.module";
import { TypeOrmConfig } from "./data-source";
import { PushModule } from "./push/push.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...TypeOrmConfig,
    }),
    ActivitiesModule,
    PushModule,
  ],
})
export class AppModule {}
