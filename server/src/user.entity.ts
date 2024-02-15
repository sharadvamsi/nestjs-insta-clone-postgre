import { Entity, Column, PrimaryGeneratedColumn, Connection, createConnection } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  image: string;
}

async function getNextUserId(): Promise<number> {
  let connection: Connection;

  try {
    // Create a new database connection
    connection = await createConnection();

    // Get the repository for the User entity
    const userRepository = connection.getRepository(User);

    // Query the database to find the maximum userId
    const maxUserIdResult = await userRepository
      .createQueryBuilder("user")
      .select("MAX(user.userId)", "maxUserId")
      .getRawOne();

    // Extract the maximum userId
    let nextUserId = 1;
    if (maxUserIdResult.maxUserId) {
      nextUserId = maxUserIdResult.maxUserId + 1;
    }

    return nextUserId;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  } finally {
    // Close the database connection
    if (connection) {
      await connection.close();
    }
  }
}
