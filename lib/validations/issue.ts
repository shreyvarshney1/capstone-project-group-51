import * as z from "zod"

export const issueSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  image: z.any().optional(), // Will handle file validation separately or refine this
})

export type IssueFormValues = z.infer<typeof issueSchema>
