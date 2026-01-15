import { lato } from "@/app/ui/fonts";
import { fetchCustomersPages } from "@/app/lib/user/data";
import { Metadata } from "next";
import { CreateUser } from "@/app/ui/users/buttons";
import Pagination from "@/app/ui/commons/pagination";
import Table from "@/app/ui/users/table";
import Search from "@/app/ui/search";
import { UsersTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Usuarios",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lato.className} text-2xl`}>Usuarios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar usuarios..." />
        <CreateUser />
      </div>
      <Suspense key={query + currentPage} fallback={<UsersTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
