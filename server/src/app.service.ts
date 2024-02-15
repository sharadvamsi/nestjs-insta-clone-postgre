import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MulterFile } from 'multer';
import { v4 as uuid } from 'uuid';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { Posts } from './post.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
  ) {}

  async login({ email, name, image }: { email: string; name: string; image: string }): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({ email, name, image });
      await this.userRepository.save(user);
    }

    return user;
  }

  async updateUserProfileImage(userId: number, profileImage: MulterFile): Promise<User> {
    const user = await this.userRepository.findOne({where: {userId}});

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove the old profile image from the storage bucket if it exists
    if (user.image) {
      try {
        await this.deleteImage(user.image);
      } catch (deleteError) {
        // Log or handle the error if deletion fails
        console.error('Failed to delete old profile image:', deleteError);
      }
    }

    // Upload the new profile image and update the user's profile image URL
    user.image = await this.uploadProfileImage(profileImage);
    await this.userRepository.save(user);

    return user;
  }

  private async uploadProfileImage(file: MulterFile): Promise<string> {
    const storage = new Storage();
    const bucketName = process.env.GCP_BUCKET_NAME;
    const fileName = `${uuid()}_${file.originalname}`;

    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);

    const writeStream = storage.bucket(bucketName).file(fileName).createWriteStream({
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

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete associated post images from GCP
    const posts = await this.postRepository.find({ where: { userId } });
    for (const post of posts) {
      if (post.imageUrl) {
        try {
          await this.deleteImage(post.imageUrl);
        } catch (deleteError) {
          // Log or handle the error if deletion fails
          console.log("Image doesn't exist");
        }
      }
    }

    // Delete the user from the database
    await this.userRepository.remove(user);
  }
  
  

  private async deleteImage(imageUrl: string): Promise<void> {
    const storage = new Storage();
    const bucketName = process.env.GCP_BUCKET_NAME;
    const fileName = imageUrl.split('/').pop();

    await storage.bucket(bucketName).file(fileName).delete();
  }
}
