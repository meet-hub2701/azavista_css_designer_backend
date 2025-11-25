import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theme from '../src/models/Theme';
import Section from '../src/models/Section';

dotenv.config();

const clearDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/styleforge');
    console.log('Connected to MongoDB');

    const themes = await Theme.deleteMany({});
    console.log(`Deleted ${themes.deletedCount} themes`);

    const sections = await Section.deleteMany({});
    console.log(`Deleted ${sections.deletedCount} sections`);

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDb();
