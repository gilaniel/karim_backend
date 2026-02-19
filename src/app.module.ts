import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivitiesModule } from "./activities/activities.module";
import { env } from "process";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: env.POSTGRES_HOST,
      port: parseInt(env.POSTGRES_PORT || ""),
      username: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DB,
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true,
      logging: true,
    }),
    ActivitiesModule,
  ],
})
export class AppModule {}
