"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const animalController_1 = require("../controllers/animalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', animalController_1.getAnimals);
router.get('/:slug', animalController_1.getAnimalBySlug);
// Admin protected routes
router.post('/', authMiddleware_1.requireAuth, animalController_1.createAnimal);
router.put('/:id', authMiddleware_1.requireAuth, animalController_1.updateAnimal);
router.delete('/:id', authMiddleware_1.requireAuth, animalController_1.deleteAnimal);
exports.default = router;
