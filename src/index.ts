import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

createConnection().then(async connection => {
  // 1.使用Repositories方式新增数据
  const user = new User();
  user.username = 'endy';
  user.password = '123456';
  const userRepository = connection.getRepository(User);
  const result = await userRepository.save(user);
  console.log("新增用户1", result);

  const user1 = new User();
  user1.username = "endy2";
  user1.password = "22222";
  const result1 = await connection.manager.save(user1);
  console.log("新增用户2", result1);

  // 修改用户
  const user2 = await userRepository.findOne(1);
  user2.password = '23456';
  const result2 = await userRepository.save(user2);
  console.log("修改用户", result2);

  // 删除用户
  await userRepository.remove(user2);
  const res3 = await userRepository.findOne(1);
  const res4 = await userRepository.findOne(2);
  console.log("删除用户", {res3,res4});

}).catch(error => console.log(error));
