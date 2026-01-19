import Image from "next/image";
import { UpdateSurvey, DeleteSurvey } from "@/app/ui/surveys/buttons";
import { formatDateToLocal } from "@/app/lib/survey/utils";
import { fetchFilteredSurveys } from "@/app/lib/survey/data";

export default async function SurveysTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const surveys = await fetchFilteredSurveys(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">
                  Título
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha de inicio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Deadline
                </th>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Creado por
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Creado el
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {surveys?.map((survey) => (
                <tr
                  key={survey.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {survey.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {survey.start_date
                      ? new Date(survey.start_date)
                          .toLocaleString()
                          .slice(0, 16)
                      : "Sin definir"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {survey.end_date
                      ? new Date(survey.end_date).toLocaleString().slice(0, 16)
                      : "Sin definir"}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={survey.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${survey.name}'s profile picture`}
                      />
                      <p>{survey.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(survey.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateSurvey id={survey.id} />
                      <DeleteSurvey id={survey.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
