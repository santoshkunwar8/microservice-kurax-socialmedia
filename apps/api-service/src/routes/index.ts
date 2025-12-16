import { createExpressEndpoints } from '@ts-rest/express';
import { Router } from 'express';
import { apiContract } from '@kuraxx/contracts';
import { authRouter } from './auth.routes';
import { messagesRouter } from './messages.routes';
import { roomsRouter } from './rooms.routes';
import { statsRouter } from './stats.routes';
import { usersRouter } from './users.routes';
import { uploadRouter } from './upload.routes';
import { postsRouter } from './posts.routes';
import { resourcesRouter } from './resources.routes';

export function setupRoutes(app: Router): void {
  // Setup ts-rest routes
  createExpressEndpoints(apiContract.auth, authRouter, app);
  createExpressEndpoints(apiContract.messages, messagesRouter, app);
  createExpressEndpoints(apiContract.rooms, roomsRouter, app);
  createExpressEndpoints(apiContract.stats, statsRouter, app);
  createExpressEndpoints(apiContract.users, usersRouter, app);
  
  // Upload routes use regular Express router due to multipart
  app.use('/upload', uploadRouter);
  
  // Posts and Resources routes
  app.use('/posts', postsRouter);
  app.use('/resources', resourcesRouter);
}

export { authRouter } from './auth.routes';
export { messagesRouter } from './messages.routes';
export { roomsRouter } from './rooms.routes';
export { statsRouter } from './stats.routes';
export { usersRouter } from './users.routes';
export { uploadRouter } from './upload.routes';
export { postsRouter } from './posts.routes';
export { resourcesRouter } from './resources.routes';
