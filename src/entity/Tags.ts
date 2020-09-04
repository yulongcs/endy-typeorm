import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Posts } from "./Post";

@Entity('tags')
export class Tags {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '主键id'
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    nullable: false,
    unique: true,
    comment: 'tag名称'
  })
  name: string;

  @ManyToMany(type => Posts, post => post.tags) // ManyToMany来说明字段的关联关系
  @JoinTable({ name: 'tags_posts' }) // 需要指定这是关系的所有者方
  posts: Posts[];
}