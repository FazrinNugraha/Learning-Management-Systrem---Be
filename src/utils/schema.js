import z, { email } from "zod";

export const exampleSchema = z.object({
    name: z.string().min(3),
    university: z.string().min(3),
    town: z.string().min(3)
})

export const signUpSchema = z.object({
    name: z.string().min(5),
    email: z.string().email(),
    password: z.string().min(3)
})

export const signInSchema = signUpSchema.omit({name: true})

export const mutateCourseSchema = z.object({
    name: z.string().min(5),
    categoryId: z.string().min(1),
    tagline: z.string().min(5),
    description: z.string().min(10),
})

export const mutateContentSchema = z.object({
    title: z.string().min(5),
    type: z.string(5),
    youtubeId: z.string().optional(),
    text: z.string(),
    courseId: z.string().min(5),
})