"use client";

import { State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import HorizontalLinearStepper from "./stepper";
import React from "react";
import SharingForm from "./sharing-form";
import GeneralInfo from "./general-info";
import { SurveyField } from "@/app/lib/survey/definitions";
import { TreeNode } from "../commons/treeSelect";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Form({
  rolesWithUsers,
  surveyFetched,
  action,
}: {
  rolesWithUsers: TreeNode[];
  surveyFetched?: SurveyField;
  action: (state: State) => State | Promise<State>;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);
  const [activeStep, setActiveStep] = React.useState(0);
  const [survey, setSurvey] = React.useState<SurveyField>(
    surveyFetched
      ? {
          ...surveyFetched,
          start_date: surveyFetched.start_date
            ? dayjs(surveyFetched.start_date)
            : null,
          end_date: surveyFetched.end_date
            ? dayjs(surveyFetched.end_date)
            : null,
        }
      : {
          id: "",
          title: "",
          description: "",
          questions: [
            {
              id: null,
              title: "",
              description: "",
              type: "single" as "single" | "multiple",
              options: [
                { name: "", position: 0 },
                { name: "", position: 1 },
              ],
              position: 0,
            },
          ],
          recipients: [],
          start_date: null,
          end_date: null,
        },
  );

  const surveyForBackend = {
    ...survey,
    start_date: survey.start_date?.format() || null,
    end_date: survey.end_date?.format() || null,
  };

  const readOnly =
    survey.start_date !== null && dayjs.utc(survey.start_date) < dayjs.utc();

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="survey"
        value={JSON.stringify(surveyForBackend)}
      />
      <HorizontalLinearStepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      >
        {activeStep === 0 && (
          <GeneralInfo
            survey={survey}
            setSurvey={setSurvey}
            readOnly={readOnly}
          />
        )}
        {activeStep === 1 && (
          <SharingForm
            rolesWithUsers={rolesWithUsers}
            survey={survey}
            setSurvey={setSurvey}
            readOnly={readOnly}
          />
        )}
      </HorizontalLinearStepper>
    </form>
  );
}
