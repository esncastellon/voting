import Form from "@/app/ui/surveys/edit-form";
import Breadcrumbs from "@/app/ui/surveys/breadcrumbs";
import { fetchInvoiceById, fetchCustomers } from "@/app/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Votación",
};

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
          { label: "Votaciones", href: "/dashboard/surveys" },
          {
            label: "Editar Votación",
            href: `/dashboard/surveys/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={poll} customers={customers} />
    </main>
  );
}
