import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchInvoiceById, fetchUsers } from "@/app/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Votación",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [poll, users] = await Promise.all([fetchInvoiceById(id), fetchUsers()]);

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
      {/* <Form invoice={poll} users={users} /> */}
    </main>
  );
}
