import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';
import { messagesContract } from './messages.contract';
import { roomsContract } from './rooms.contract';
import { uploadContract } from './upload.contract';
import { usersContract } from './users.contract';

const c = initContract();

// ============= Main API Contract =============
export const apiContract = c.router({
  auth: authContract,
  messages: messagesContract,
  rooms: roomsContract,
  upload: uploadContract,
  users: usersContract,
});

export type ApiContract = typeof apiContract;

// Re-export all contracts
export { authContract } from './auth.contract';
export { messagesContract } from './messages.contract';
export { roomsContract } from './rooms.contract';
export { uploadContract } from './upload.contract';
export { usersContract } from './users.contract';

// Re-export schemas
export * from './schemas';
