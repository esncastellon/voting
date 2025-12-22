import Form from "@/app/ui/users/create-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchRoles } from "@/app/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Usuario",
};

export default async function Page() {
  const roles = await fetchRoles();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Usuarios", href: "/dashboard/users" },
          {
            label: "Crear Usuario",
            href: "/dashboard/users/create",
            active: true,
          },
        ]}
      />
      <Form roles={roles} />
    </main>
  );
}
