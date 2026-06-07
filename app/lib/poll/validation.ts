import { z } from "zod";

const StatusSchema = z.enum(["draft", "open", "closed"]);

const OptionSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim(),
  position: z.coerce.number().int().min(0),
});

const StartsAtSchema = z
  .string()
  .nullable()
  .optional()
  .default(null)
  .refine(
    (value) => value === null || !Number.isNaN(new Date(value).getTime()),
    {
      message: "La fecha de inicio no es valida.",
    },
  );

const EndsAtSchema = z
  .string()
  .nullable()
  .optional()
  .default(null)
  .refine(
    (value) => value === null || !Number.isNaN(new Date(value).getTime()),
    {
      message: "La fecha de cierre no es valida.",
    },
  );

export const PollInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1, "El titulo es obligatorio."),
    description: z.string().trim().optional().default(""),
    question: z.string().trim().min(1, "La pregunta es obligatoria."),
    status: StatusSchema,
    starts_at: StartsAtSchema,
    ends_at: EndsAtSchema,
    options: z
      .array(OptionSchema)
      .transform((options) =>
        options
          .filter((option) => option.label.trim().length > 0)
          .sort((a, b) => a.position - b.position)
          .map((option, index) => ({ ...option, position: index })),
      )
      .refine((options) => options.length >= 2, {
        message: "La votacion necesita al menos dos opciones.",
      }),
  })
  .refine(
    (poll) =>
      !poll.starts_at ||
      !poll.ends_at ||
      new Date(poll.starts_at).getTime() <= new Date(poll.ends_at).getTime(),
    {
      message: "La fecha de inicio debe ser anterior a la fecha de cierre.",
      path: ["ends_at"],
    },
  );

export type PollInputData = z.infer<typeof PollInputSchema>;

export function validatePollInput(input: unknown) {
  return PollInputSchema.safeParse(input);
}
