"use-server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { FormState } from "./definitions";
import z, { email } from "zod";

const FormSchema = z.object({
  email: z
    .email({
      error: "Please type an email.",
    })
    .trim(),
  password: z
    .string()
    .min(8, { error: "Be at least 8 characters long" })
    .trim(),
});

export async function authenticate(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = FormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials." };
        default:
          return { message: "Something went wrong." };
      }
    }
    throw error;
  }
}
