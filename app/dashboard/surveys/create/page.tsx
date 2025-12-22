import Form from "@/app/ui/surveys/create-form";
import Breadcrumbs from "@/app/ui/surveys/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Votación",
};

export default async function Page() {
  const customers = await fetchCustomers();

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
      <Form customers={customers} />
    </main>
  );
}
