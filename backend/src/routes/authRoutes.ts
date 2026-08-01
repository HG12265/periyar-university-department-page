import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/validator';
import { loginSchema } from '../validators/schemas';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { verifyCsrf } from '../middleware/csrf';
import { getCurrentUser } from '../middleware/auth';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', verifyCsrf, AuthController.logout);
router.post('/refresh', verifyCsrf, AuthController.refresh);
router.get('/me', getCurrentUser, AuthController.getMe);

export default router;
