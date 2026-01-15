"use client";

import { State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import HorizontalLinearStepper from "./stepper";
import React from "react";
import SharingForm from "./sharing-form";
import GeneralInfo from "./general-info";
import { SurveyField } from "@/app/lib/survey/definitions";
import { TreeNode } from "../commons/treeSelect";

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
    surveyFetched || {
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
    }
  );

  const readOnly = survey.start_date !== null && survey.start_date < new Date();

  return (
    <form action={formAction}>
      <input type="hidden" name="survey" value={JSON.stringify(survey)} />
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
