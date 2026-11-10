import { Router } from 'express';
import {
  getAnimals,
  getAnimalBySlug,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../controllers/animalController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAnimals);
router.get('/:slug', getAnimalBySlug);

// Admin protected routes
router.post('/', requireAuth, createAnimal);
router.put('/:id', requireAuth, updateAnimal);
router.delete('/:id', requireAuth, deleteAnimal);

export default router;
