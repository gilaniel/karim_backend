import { env } from "process";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

type DataSourceTypes = DataSourceOptions & {
  cli: {
    migrationsDir: string;
  };
};

config();

const MigrationOrmSource = new DataSource({
  type: "postgres",

  host: env.POSTGRES_HOST,
  port: parseFloat(env.POSTGRES_PORT || "5432"),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,

  entities: [__dirname + "/../**/entities/*.entity.ts"],
  migrations: [__dirname + "/../migrations/*.ts"],

  synchronize: false,
  logging: false,
  migrationsRun: true,

  cli: {
    migrationsDir: "src/migrations",
  },
} as DataSourceTypes);

const TypeOrmConfig = {
  ...MigrationOrmSource.options,

  autoLoadEntities: true,

  entities: [__dirname + "/**/*.entity.{js,ts}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
};

export { TypeOrmConfig };
export default MigrationOrmSource;
