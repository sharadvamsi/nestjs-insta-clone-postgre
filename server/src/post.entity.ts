import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  postId: number;

  @Column()
  userId: number;

  @Column()
  imageUrl: string;

  @Column()
  caption: string;

  @Column()
  userProfileUrl: string;

  @Column()
  userName: string;

  @Column({ type: 'jsonb', default: [] })
  likes: number[];

  @Column({ default: 0 })
  likesCount: number;

  @Column('jsonb', { default: [] })
  comments: { userId: number; comment: string }[];
}
