import express from 'express';
import { deleteContentCourse, getCategories, getCourseById, getCourses, postContentCourse, updateContentCourse, updateCourse } from '../controllers/courseController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import multer from 'multer';
import { fileStorageCourses, fileFilter } from '../utils/multer.js';
import { postCourse } from '../controllers/courseController.js';
import { deleteCourse } from '../controllers/courseController.js';
import { mutateContentSchema } from '../utils/schema.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { getDetailContent } from '../controllers/courseController.js';

const courseRoutes = express.Router()

const upload = multer({
    storage: fileStorageCourses,
    fileFilter
})

courseRoutes.get('/courses', verifyToken, getCourses)
courseRoutes.get('/categories', verifyToken, getCategories)
courseRoutes.get('/courses/:id', verifyToken, getCourseById)
courseRoutes.post('/courses', verifyToken, upload.single('thumbnail'), postCourse)
courseRoutes.put('/courses/:id', verifyToken, upload.single('thumbnail'), updateCourse)
courseRoutes.delete('/courses/:id', verifyToken, deleteCourse)

courseRoutes.post('/courses/contents', verifyToken, validateRequest(mutateContentSchema), postContentCourse)
courseRoutes.put('/courses/contents/:id', verifyToken, validateRequest(mutateContentSchema), updateContentCourse)
courseRoutes.delete('/courses/contents/:id', verifyToken, deleteContentCourse)
courseRoutes.get('/courses/contents/:id', verifyToken, getDetailContent)





export default courseRoutes;