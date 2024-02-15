import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from './auth.service'; // Import AuthService
import { User } from './user.entity'; // Import User entity
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from 'multer';
import { PostService } from './post.service';
import { Posts } from './post.entity';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authService: AuthService, private readonly postService: PostService) {}

  @Post('/login')
  async login(@Body('token') token): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user: User = {
      userId: undefined,
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      
    };

    const userExists = await this.appService.login(user);
    const generatedToken = await this.authService.generateToken(userExists);

    return { token: generatedToken };
  }

  @Post('/posts/like')
  async likePost(
    @Body('postId') postId: number,
    @Body('userId') userId: number
  ): Promise<Posts> {
    try {
      return await this.postService.likePost(postId, userId);
    } catch (error) {
      throw error;
    }
  }

  @Post('/posts/comment')
  async addCommentToPost(
    @Body('postId') postId: number,
    @Body('userId') userId: number,
    @Body('comment') comment: string,
  ): Promise<Posts> {
    try {
      return await this.postService.addCommentToPost(postId, userId, comment);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/profile-image')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateUserProfileImage(
    @Param('id') userId: number,
    @UploadedFile() profileImage: MulterFile,
  ): Promise<User> {
    return this.appService.updateUserProfileImage(userId, profileImage);
  }

  @Post('/posts')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Body('userId') userId: number,
    @Body('caption') caption: string,
    @UploadedFile() image: MulterFile,
  ): Promise<any> {
    try {
      // Create the post
      const post = await this.postService.createPost(userId, image, caption);
      return { message: 'Post created successfully', post };
    } catch (error) {
      throw error;
    }
  }

  @Get('/posts')
  async getAllPosts(): Promise<Posts[]> {
    return this.postService.getAllPosts();
  }

  @Delete('/users/:userId')
  async deleteUser(@Param('userId') userId: number): Promise<any> {
    try {
      await this.appService.deleteUser(userId);
      return "user deleted successfully"
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Handle the case where the user is not found
        // Return appropriate response to the client
        throw new NotFoundException('User not found');
      }
      // Log or handle other types of errors
      console.error('Error deleting user:', error);
      // Return appropriate response to the client
      // For example, return a 500 Internal Server Error
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
