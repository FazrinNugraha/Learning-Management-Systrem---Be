import express from 'express';
import { getCourses } from '../controllers/courseController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import multer from 'multer';
import { fileStorageCourses, fileFilter } from '../utils/multer.js';
import { postCourse } from '../controllers/courseController.js';

const courseRoutes = express.Router()

const upload = multer ({
    storage: fileStorageCourses,
    fileFilter
})

courseRoutes.get('/courses', verifyToken, getCourses)
courseRoutes.post('/courses', verifyToken, upload.single('thumbnail'), postCourse)


export default courseRoutes;