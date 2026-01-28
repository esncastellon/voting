"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { signIn, auth, getUser } from "@/auth";
import { AuthError } from "next-auth";
import { QuestionField, SurveyField } from "./definitions";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  recipients: z.string().array().optional(),
  questions: z
    .array(
      z.object({
        id: z.number().nullable().optional(),
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["single", "multiple"]),
        options: z.array(
          z.object({
            id: z.number().optional(),
            name: z.string(),
            position: z.number(),
          }),
        ),
        position: z.number(),
      }),
    )
    .optional(),
});

const CreateSurvey = FormSchema.omit({ id: true });

const UpdateSurvey = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    title?: string[];
    description?: string[];
    startDate?: string[];
    endDate?: string[];
    recipients?: string[];
    questions?: QuestionField[];
  };
  message?: string | null;
};

export async function createSurvey(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const raw = formData.get("survey") as string;
  const survey: SurveyField = JSON.parse(raw);

  const validatedFields = CreateSurvey.safeParse(survey);

  if (!validatedFields.success) {
    return {
      message: "Missing Fields. Failed to Create Survey.",
    };
  }

  try {
    const session = await auth();
    if (session?.user) {
      const user = await getUser(session.user.email!);
      if (!user) {
        return {
          message: "Unauthorized. Please log in.",
        };
      }

      const { start_date, end_date } = validatedFields.data;
      const result = await sql`
    INSERT INTO surveys (title, description, start_date, end_date, created_by)
    VALUES (${survey.title}, ${survey.description}, 
            ${survey.start_date ? sql`TO_TIMESTAMP(${start_date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')` : null},
            ${survey.end_date ? sql`TO_TIMESTAMP(${end_date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')` : null},
            ${user.id})
    RETURNING id
  `;
      const surveyId = result[0].id;

      await createSurveyQuestions(surveyId, survey.questions);
      if (survey.recipients && survey.recipients.length > 0) {
        await createSurveysUsers(surveyId, survey.recipients);
      }
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Survey.",
    };
  }

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function createSurveyQuestions(
  surveyId: string,
  questions: QuestionField[],
) {
  try {
    for (const question of questions) {
      const result = await sql`
      INSERT INTO survey_questions (survey_id, title, description, type, position)
      VALUES (${surveyId}, ${question.title}, ${question.description}, ${
        question.type === "single" ? 1 : 2
      }, ${question.position})
      RETURNING id
    `;

      const questionId = result[0].id;

      for (const option of question.options) {
        await sql`
        INSERT INTO survey_options (question_id, name, position)
        VALUES (${questionId}, ${option.name}, ${option.position})
      `;
      }
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create survey questions.");
  }
}

export async function createSurveysUsers(
  surveyId: string,
  recipients: string[],
) {
  try {
    for (const recipient of recipients) {
      await sql`
          INSERT INTO surveys_users (survey_id, user_id)
          VALUES (${surveyId}, ${recipient})
        `;
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create survey users.");
  }
}

export async function updateSurvey(prevState: State, formData: FormData) {
  const raw = formData.get("survey") as string;
  const survey: SurveyField = JSON.parse(raw);

  const validatedFields = UpdateSurvey.safeParse(survey);

  if (!validatedFields.success) {
    return {
      message: "Missing Fields. Failed to Update Survey.",
    };
  }

  try {
    const { end_date } = validatedFields.data;
    await sql`
    UPDATE surveys
    SET
      title = ${survey.title},
      description = ${survey.description},
      end_date = ${end_date}
    WHERE id = ${survey.id}
  `;
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Update Survey.",
    };
  }

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function updateSurveyDetails(
  prevState: State,
  formData: FormData,
) {
  const raw = formData.get("survey") as string;
  const survey: SurveyField = JSON.parse(raw);

  const validatedFields = UpdateSurvey.safeParse(survey);

  if (!validatedFields.success) {
    return {
      message: "Missing Fields. Failed to Update Survey.",
    };
  }

  try {
    const { start_date, end_date } = validatedFields.data;
    await sql`
    UPDATE surveys
    SET
      title = ${survey.title},
      description = ${survey.description},
      start_date = TO_TIMESTAMP(${start_date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      end_date = TO_TIMESTAMP(${end_date}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    WHERE id = ${survey.id}
  `;

    await sql`DELETE FROM survey_options WHERE question_id IN (
      SELECT id FROM survey_questions WHERE survey_id = ${survey.id}
    )`;
    await sql`DELETE FROM survey_questions WHERE survey_id = ${survey.id}`;
    await createSurveyQuestions(survey.id, survey.questions);

    await sql`DELETE FROM surveys_users WHERE survey_id = ${survey.id}`;
    if (survey.recipients && survey.recipients.length > 0) {
      await createSurveysUsers(survey.id, survey.recipients);
    }
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Update Survey.",
    };
  }

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function deleteSurvey(id: string) {
  await sql`DELETE FROM survey_answers WHERE survey_id = ${id}`;
  await sql`DELETE FROM survey_questions WHERE survey_id = ${id}`;
  await sql`DELETE FROM surveys_users WHERE survey_id = ${id}`;

  await sql`DELETE FROM surveys WHERE id = ${id}`;
  revalidatePath("/dashboard/surveys");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
