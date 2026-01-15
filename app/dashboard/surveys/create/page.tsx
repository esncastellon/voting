import Form from "@/app/ui/surveys/create-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchRolesWithUsers } from "@/app/lib/user/data";
import { Metadata } from "next";
import { createSurvey } from "@/app/lib/survey/actions";

export const metadata: Metadata = {
  title: "Crear Votación",
};

export default async function Page() {
  const rolesWithUsers = await fetchRolesWithUsers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Votaciones", href: "/dashboard/surveys" },
          {
            label: "Crear Votación",
            href: "/dashboard/surveys/create",
            active: true,
          },
        ]}
      />
      <Form rolesWithUsers={rolesWithUsers} action={createSurvey as any} />
    </main>
  );
}
