import clsx from "clsx";
import { lato } from "@/app/ui/fonts";
import { fetchLatestSurveys } from "@/app/lib/survey/data";

export default async function LatestSurveys() {
  const latestSurveys = await fetchLatestSurveys();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lato.className} mb-4 text-xl md:text-2xl`}>
        Últimas votaciones
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestSurveys.map((survey, i) => {
            return (
              <div
                key={survey.id}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  }
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {survey.title}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {survey.description}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lato.className} truncate text-sm font-medium md:text-base`}
                >
                  {survey.start_date
                    ? new Date(survey.start_date).toLocaleDateString()
                    : "Sin definir"}
                </p>
                <p
                  className={`${lato.className} truncate text-sm font-medium md:text-base`}
                >
                  {survey.end_date
                    ? new Date(survey.end_date).toLocaleDateString()
                    : "Sin definir"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
