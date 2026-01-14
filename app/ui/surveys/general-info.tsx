"use client";

import React from "react";
import SurveyQuestions from "./survey-questions";
import TextField from "@mui/material/TextField";
import { QuestionField, SurveyField } from "@/app/lib/survey/definitions";

export default function GeneralInfo({
  survey,
  setSurvey,
}: {
  survey: SurveyField;
  setSurvey: React.Dispatch<React.SetStateAction<SurveyField>>;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSurvey({ ...survey, [name]: value });
  };

  const setQuestions = (questions: QuestionField[]) => {
    setSurvey((prev) => ({ ...prev, questions }));
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      {/* Title */}
      <TextField
        fullWidth
        id="title"
        name="title"
        label="Título de la votación"
        placeholder="Introduce el título de la votación"
        variant="standard"
        value={survey.title}
        onChange={handleInputChange}
      />

      {/* Description */}
      <TextField
        fullWidth
        id="description"
        name="description"
        label="Descripción de la votación"
        placeholder="Introduce la descripción de la votación"
        variant="standard"
        className="mt-4"
        value={survey.description}
        onChange={handleInputChange}
      />

      <SurveyQuestions
        questions={survey.questions}
        setQuestions={setQuestions}
      />
    </div>
  );
}
