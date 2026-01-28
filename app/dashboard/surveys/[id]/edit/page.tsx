import Form from "@/app/ui/surveys/create-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchRolesWithUsers } from "@/app/lib/user/data";
import { fetchSurveyDetailsById } from "@/app/lib/survey/data";
import { updateSurvey, updateSurveyDetails } from "@/app/lib/survey/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const metadata: Metadata = {
  title: "Editar Votación",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [rolesWithUsers, survey] = await Promise.all([
    fetchRolesWithUsers(),
    fetchSurveyDetailsById(id),
  ]);

  if (!survey) {
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
      <Form
        surveyFetched={survey}
        rolesWithUsers={rolesWithUsers}
        action={
          survey.start_date && dayjs.utc(survey.start_date) < dayjs.utc()
            ? (updateSurvey as any)
            : updateSurveyDetails
        }
      />
    </main>
  );
}
