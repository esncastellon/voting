import Form from "@/app/ui/surveys/create-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchUsers, fetchRoles } from "@/app/lib/user/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Votación",
};

export default async function Page() {
  const users = await fetchUsers();
  const roles = await fetchRoles();

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
      <Form users={users} roles={roles} />
    </main>
  );
}
