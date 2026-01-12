"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  recipients: z.string().array().optional(),
});

const CreatePoll = FormSchema.omit({ id: true });

const UpdatePoll = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    title?: string[];
    description?: string[];
    startDate?: string[];
    endDate?: string[];
    recipients?: string[];
  };
  message?: string | null;
};

export async function createPoll(prevState: State, formData: FormData) {
  const validatedFields = CreatePoll.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    recipients: formData.get("recipients"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Poll.",
    };
  }

  const { title, description, startDate, endDate, recipients } =
    validatedFields.data;
  const date = new Date().toISOString().split("T")[0];
  try {
    await sql`
    INSERT INTO polls (title, description, start_date, end_date, created_at, created_by, status)
    VALUES (${title}, ${description}, ${startDate}, ${endDate}, now(), 'admin', 'activa')
  `;
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Poll.",
    };
  }

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function updatePoll(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdatePoll.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    recipients: formData.get("recipients"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Poll.",
    };
  }

  const { title, description, startDate, endDate, recipients } =
    validatedFields.data;

  try {
    await sql`
    UPDATE polls
    SET title = ${title}, description = ${description}, start_date = ${startDate}, end_date = ${endDate}, status = 'activa'
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Update Poll.",
    };
  }
  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function deletePoll(id: string) {
  await sql`DELETE FROM polls WHERE id = ${id}`;
  revalidatePath("/dashboard/surveys");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
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
