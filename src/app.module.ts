// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivitiesModule } from "./activities/activities.module";
import { TypeOrmConfig } from "./data-source";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...TypeOrmConfig,
    }),
    ActivitiesModule,
  ],
})
export class AppModule {}
