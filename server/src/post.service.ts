import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './post.entity';
import { MulterFile } from 'multer';
import { v4 as uuid } from 'uuid';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { User } from './user.entity';

@Injectable()
export class PostService {
    constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @InjectRepository(User ) // Inject the User repository
    private readonly userRepository: Repository<User>, // Inject the User repository
  ) {}


  async getUserProfileData(userId: number): Promise<{ imageUrl: string; name: string }> {
    try {
      // Fetch user's profile data directly from the User repository
      const user = await this.userRepository.findOne({where: {userId}});
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Return user's profile data
      return { imageUrl: user.image, name: user.name };
    } catch (error) {
      throw error;
    }
  }
  

  async createPost(userId: number, file: MulterFile, caption: string): Promise<Posts> {
    try {
      // Fetch user's profile data
      const userProfileData = await this.getUserProfileData(userId);
  
      // Upload post image
      const imageUrl = await this.uploadPostImage(file);
  
      // Create new post entity
      const post = new Posts();
      post.userId = userId;
      post.imageUrl = imageUrl;
      post.caption = caption;
      post.userProfileUrl = userProfileData.imageUrl;
      post.userName = userProfileData.name;
  
      // Save the new post entity
      return this.postRepository.save(post);
    } catch (error) {
      throw error;
    }
  }
  

  async uploadPostImage(file: MulterFile): Promise<string> {
    const storage = new Storage();
    const bucketName = process.env.GCP_BUCKET_NAME;
    const fileName = `${uuid()}_${file.originalname}`;

    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);

    const writeStream = storage
      .bucket(bucketName)
      .file(fileName)
      .createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

    fileStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream
        .on('finish', resolve)
        .on('error', (error) => {
          reject(error);
        });
    });

    const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return imageUrl;
  }

  async getAllPosts(): Promise<Posts[]> {
    return await this.postRepository.find();
  }

  async likePost(postId: number, userId: number): Promise<Posts> {
    try {
        const post = await this.postRepository.findOne({ where: { postId } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if the user already liked the post
        const alreadyLiked = post.likes.includes(userId);
        if (!alreadyLiked) {
            // Add like if not already liked
            post.likes.push(userId);
            // Update the likes count
            post.likesCount = post.likes.length;
            // Save the updated post
            return await this.postRepository.save(post);
        } else {
            // User has already liked the post, return the post without updating
            return post;
        }
    } catch (error) {
        throw error;
    }
}






  async addCommentToPost(postId: number, userId: number, comment: string): Promise<Posts> {
    const post = await this.postRepository.findOne({where: {postId}});
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.comments.push({ userId, comment });

    return await this.postRepository.save(post);
  }
}

