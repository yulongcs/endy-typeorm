import "reflect-metadata";
import { createConnection, getConnection, getManager, getRepository } from "typeorm";
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
  // 多条件查找 and
  const selResult3 = await postsRepository.findOne({ where: { id: 1, title: '帖子一' }, relations: ['tags', 'user'] });
  console.log('多条件查找-and', selResult3);
  // 多条件查找 or
  const selResult4 = await postsRepository.findOne({ where: [{ id: 1 }, { title: '帖子二' }], relations: ['tags', 'user'] });
  console.log('多条件查找-or', selResult4);
  // 使用join
  const selJoinResult = await userRepository.find({
    join: {
      alias: 'user',
      leftJoinAndSelect: {
        detail: 'user.userDetail',
        posts: 'user.posts'
      }
    }
  });
  console.log('join关系查询', selJoinResult);
  // order排序
  const orderResult = await userRepository.find({
    order: {
      id: 'DESC',
      username: 'ASC'
    }
  });
  console.log('order排序', orderResult);

  // 分页查询
  const pagesResult = await userRepository.find({
    skip: 0,
    take: 10,
  })
  console.log('分页查询', pagesResult);

  // 修改用户
  const user2 = await userRepository.findOne(2);
  user2.password = '23456';
  const result2 = await userRepository.save(user2);
  console.log("修改用户", result2);

  // 删除用户
  await userRepository.remove(user2);
  const res3 = await userRepository.findOne(2);
  const res4 = await userRepository.findOne(1);
  console.log("删除用户", { res3, res4 });

  // QueryBuilder
  // 1.使用connection创建
  const qbUser = await getConnection()
    .createQueryBuilder()
    .select(['user.id', 'user.username']) // 需要选择查询的字段,如果想要全部查询可以不加select
    .from(User, 'user') // 从哪张表,并且定义别名为user
    .where('(user.id=:id)', { id: 1 }) // 过滤条件
    .getOne(); // 查询一个
  console.log('QueryBuilder-使用connection创建1', qbUser);
  // 2.使用connection创建
  const qbUser2 = await getConnection()
    .createQueryBuilder(User, 'user')
    .select(['user.id', 'user.username'])
    .where('(user.id=:id)', { id: 1 })
    .getOne();
  console.log('QueryBuilder-使用connection创建2', qbUser2);
  // 3.使用entity manager创建
  const qbUser3 = await getManager()
    .createQueryBuilder(User, 'user')
    .select('user')
    .getMany();
  console.log('QueryBuilder-使用entity创建', qbUser3);
  // 4.使用repository创建
  const qbUser4 = await getRepository(User)
    .createQueryBuilder('user')
    .getMany();
  console.log('QueryBuilder-使用repository创建', qbUser4);

  //QueryBuilder 查询数据
  const qbSelUser = await getConnection()
    .createQueryBuilder(User, 'user')
    .select(['user.id', 'user.username'])
    // 直接查询
    .where('(user.id=:id)', { id: 1 })
    // setParameter
    .where("user.username = :username").setParameter("username", "Endy")
    // 模糊查询
    // .where("user.username like :username", {username: `% %{username} %`})
    // in 查询
    // .where("user.username IN (:...username)", { username: [ "Endy", "Cristal", "Lina" ] })
    .getOne();
  console.log('QueryBuilder-查询数据', qbSelUser);

  // 插入数据
  const qbInsertUser = await getConnection()
    .createQueryBuilder()
    .insert() // 插入数据的时候要指明插入到那个实体类
    .into(User)
    .values([{ username: '张三', password: '1234' }, { username: '李四', password: '12345' }])
    .execute();
  console.log('QueryBuilder-查询数据', qbInsertUser);

  // 更新数据
  const qbUpdateUser = await getConnection()
    .createQueryBuilder()
    .update(User)
    .set({ username: '哈哈哈' })
    .where('id=:id', { id: 1 })
    .execute();
  console.log('QueryBuilder-更新数据', qbUpdateUser);

  // 删除数据
  const qbDeleteUser = await getConnection()
    .createQueryBuilder()
    .delete()
    .from(User)
    .where('id=:id', { id: 3 })
    .execute();
  console.log('QueryBuilder-删除数据', qbDeleteUser);

  // 创建关系查询
  const qbQueryUser = await getConnection()
    .createQueryBuilder(User, 'user')
    // 第一个参数是定义字段,第二个实体类,第三个是别名,第四个是条件
    .leftJoinAndMapMany('user.posts', Posts, 'posts', 'user.id=posts.userId')
    .getMany();
  console.log('创建关系查询', (qbQueryUser));

}).catch(error => console.log(error));
