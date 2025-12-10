import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Prevent multiple instances during hot reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions = {
  log: (config.nodeEnv === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']) as any,
};

export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (config.nodeEnv !== 'production') {
  global.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

export default prisma;
