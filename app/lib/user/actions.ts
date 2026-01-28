"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  name: z.string({
    error: "Please type a name.",
  }),
  email: z.string({
    error: "Please type an email.",
  }),
  roleId: z.string({
    error: "Please select a role.",
  }),
  password: z.string(),
});

const CreateUser = FormSchema.omit({ id: true, password: true });

const UpdateUser = FormSchema.omit({ id: true, password: true });

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    roleId?: string[];
  };
  message?: string | null;
};

export async function createUser(prevState: State, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create User.",
    };
  }

  const { name, email, roleId } = validatedFields.data;

  const password = Math.random().toString(36).slice(-8); // Generate a simple random password
  const image_url = "/users/evil-rabbit.png"; // Default image URL

  try {
    await sql`
    INSERT INTO users (name, email, role_id, password, image_url)
    VALUES (${name}, ${email}, ${roleId}, ${password}, ${image_url})
  `;
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create User.",
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}
