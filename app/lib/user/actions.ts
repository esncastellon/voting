"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import { hashPassword } from "./password";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const CreateUser = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  email: z.email("El email no es válido.").trim(),
  roleId: z.uuid("Selecciona un rol."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    roleId?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function createUser(prevState: State, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear el usuario.",
    };
  }

  const { name, email, roleId, password } = validatedFields.data;
  const hashedPassword = await hashPassword(password);
  const imageUrl = "/users/default-avatar.svg";

  try {
    await sql`
    INSERT INTO users (name, email, role_id, password, image_url)
    VALUES (${name}, ${email}, ${roleId}, ${hashedPassword}, ${imageUrl})
  `;
  } catch (error) {
    console.error(error);
    return {
      message: "Error de base de datos: no se pudo crear el usuario.",
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}
