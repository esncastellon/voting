import Form from "@/app/ui/surveys/create-form";
import Breadcrumbs from "@/app/ui/commons/breadcrumbs";
import { fetchRolesWithUsers } from "@/app/lib/user/data";
import { fetchSurveyDetailsById } from "@/app/lib/survey/data";
import { updateSurvey, updateSurveyDetails } from "@/app/lib/survey/actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
          survey.start_date && survey.start_date < new Date()
            ? (updateSurvey as any)
            : updateSurveyDetails
        }
      />
    </main>
  );
}
