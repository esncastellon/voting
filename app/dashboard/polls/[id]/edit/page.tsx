import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchInvoiceById, fetchCustomers } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [poll, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!poll) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Votaciones", href: "/dashboard/polls" },
          {
            label: "Editar Votación",
            href: `/dashboard/polls/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={poll} customers={customers} />
    </main>
  );
}
