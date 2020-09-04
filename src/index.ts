import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { UserExtend } from "./entity/UserExtend";
import { Posts } from "./entity/Post";
import { Tags } from "./entity/Tags";

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

  const userExtend = new UserExtend();
  userExtend.mobile = '13412345678';
  userExtend.address = '中国';
  // 关联两个数据模型
  userExtend.user = user;
  const userExtendRepository = connection.getRepository(UserExtend);
  await userExtendRepository.save(userExtend);

  // 创建tag1
  const tag1 = new Tags();
  tag1.name = 'mysql';

  // 创建tag2
  const tag2 = new Tags();
  tag2.name = 'node';

  const tagRepository = connection.getRepository(Tags);
  await tagRepository.save(tag1);
  await tagRepository.save(tag2);

  // 帖子一
  const posts1 = new Posts();
  posts1.title = '文章一';
  posts1.content = '文章一内容';
  posts1.tags = [tag1, tag2];

  // 帖子二
  const posts2 = new Posts();
  posts2.title = '文章二';
  posts2.content = '文章二内容';
  posts2.tags = [tag1];


  const postsRepository = connection.getRepository(Posts);
  await postsRepository.save(posts1);
  await postsRepository.save(posts2);

  user.posts = [posts1, posts2];
  await userRepository.save(user);
  
  // 查询数据
  // 使用relations关联查询数据(正向查找)
  // userDetail就是当前表中定义的字段
  const selResult = await userRepository.find();
  console.log("查询数据", selResult);
  const selRelationsResult = await userRepository.find({ relations: ['posts', 'userDetail'] });
  console.log("正向查找", selRelationsResult);
  const selResult1 = await userExtendRepository.find({ relations: ['user'] });
  console.log('反向查找', selResult1);
  const postResult = await postsRepository.findOne({ where: { id: 1 }, relations: ['tags', 'user'] });
  console.log('查询帖子一拥有的tag及用户信息', postResult);

  // 修改用户
  const user2 = await userRepository.findOne(2);
  user2.password = '23456';
  const result2 = await userRepository.save(user2);
  console.log("修改用户", result2);

  // 删除用户
  await userRepository.remove(user2);
  const res3 = await userRepository.findOne(2);
  const res4 = await userRepository.findOne(1);
  console.log("删除用户", {res3,res4});

}).catch(error => console.log(error));
