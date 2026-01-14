import Pagination from "@/app/ui/commons/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/surveys/table";
import { CreateSurvey } from "@/app/ui/surveys/buttons";
import { lato } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchSurveysPages } from "@/app/lib/survey/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votaciones",
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
  const totalPages = await fetchSurveysPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lato.className} text-2xl`}>Votaciones</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar votaciones..." />
        <CreateSurvey />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
