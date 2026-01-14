"use client";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Add, Remove } from "@mui/icons-material";
import QuestionForm from "./question";
import { QuestionField } from "@/app/lib/survey/definitions";
import Box from "@mui/material/Box";

export default function SurveyQuestions({
  questions,
  setQuestions,
}: {
  questions: QuestionField[];
  setQuestions: (questions: QuestionField[]) => void;
}) {
  const addQuestion = () =>
    setQuestions([
      ...questions,
      {
        title: "",
        description: "",
        type: "single" as "single" | "multiple",
        options: [
          { name: "", position: 0 },
          { name: "", position: 1 },
        ],
        position: questions.length,
      },
    ]);
  const removeQuestion = (index: number) =>
    setQuestions(questions.filter((_, i) => i !== index));

  const setQuestion = (index: number, question: QuestionField) => {
    const newQuestions = questions.map((q, i) => (i === index ? question : q));
    setQuestions(newQuestions);
  };

  return (
    <div className="pt-4">
      <Typography mt={2} mb={1}>
        Preguntas
      </Typography>
      {questions.map((question, index) => (
        <Box
          key={index}
          mb={4}
          p={2}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
        >
          <QuestionForm
            question={question}
            setQuestion={(updatedQuestion) =>
              setQuestion(index, updatedQuestion)
            }
          />
          <IconButton
            onClick={() => removeQuestion(index)}
            disabled={questions.length <= 1}
          >
            <Remove />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" startIcon={<Add />} onClick={addQuestion}>
        Agregar pregunta
      </Button>
    </div>
  );
}
