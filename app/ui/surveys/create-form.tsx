"use client";

import { RoleField } from "@/app/lib/user/definitions";
import { createSurvey, State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import HorizontalLinearStepper from "./stepper";
import React from "react";
import SharingForm from "./sharing-form";
import GeneralInfo from "./general-info";
import { SurveyField } from "@/app/lib/survey/definitions";

export default function Form({ roles }: { roles: RoleField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createSurvey, initialState);
  const [activeStep, setActiveStep] = React.useState(0);
  const [survey, setSurvey] = React.useState<SurveyField>({
    title: "",
    description: "",
    questions: [
      {
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
    startDate: null,
    endDate: null,
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="survey" value={JSON.stringify(survey)} />
      <HorizontalLinearStepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      >
        {activeStep === 0 && (
          <GeneralInfo survey={survey} setSurvey={setSurvey} />
        )}
        {activeStep === 1 && (
          <SharingForm roles={roles} survey={survey} setSurvey={setSurvey} />
        )}
      </HorizontalLinearStepper>
    </form>
  );
}
