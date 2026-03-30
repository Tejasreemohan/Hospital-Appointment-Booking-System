import express from 'express';
import { getHospitals, getHospitalDetails } from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/', getHospitals); // Get hospitals based on location
router.get('/:id', getHospitalDetails); // Get hospital details and services

export default router;
