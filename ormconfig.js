module.exports = {
  type: 'mysql',
  host: process.env.IP,
  port:  process.env.PORT,
  username: 'root',
  password: process.env.PASSWORD,
  database: 'typeorm_mysql',
  synchronize: true,
  logging: true,
  dropSchema: true,
  charset: "utf8mb4",
  timezone: "local",
  entities: [
    'src/entity/**/*.ts'
  ],
  migrations: [
    "src/migration/**/*.ts"
 ],
 subscribers: [
    "src/subscriber/**/*.ts"
 ],
 cli: {
    "entitiesDir": "src/entity",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
 }
}