import z from "zod";

export const exampleSchema = z.object({
    name: z.string().min(3),
    university: z.string().min(3),
    town: z.string().min(3)



})