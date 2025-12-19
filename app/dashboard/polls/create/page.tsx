import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Votaciones", href: "/dashboard/polls" },
          {
            label: "Crear Votación",
            href: "/dashboard/polls/create",
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}
