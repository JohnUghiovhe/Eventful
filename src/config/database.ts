import mongoose from 'mongoose';
import config from './environment';

export async function connectToMongoDB(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Connected to MongoDB successfully');
  } catch (error) {
    console.error('✗ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectFromMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Error disconnecting from MongoDB:', error);
  }
}

export default mongoose;
