"use client";

import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Add, Remove } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { QuestionField } from "@/app/lib/survey/definitions";

export default function QuestionForm({
  question,
  setQuestion,
}: {
  question: QuestionField;
  setQuestion: (question: QuestionField) => void;
}) {
  const handleTitleChange = (value: string) => {
    setQuestion({ ...question, title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setQuestion({ ...question, description: value });
  };

  // Cambiar tipo de pregunta
  const handleTypeChange = (value: "single" | "multiple") => {
    setQuestion({ ...question, type: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    setQuestion({
      ...question,
      options: question.options.map((opt, i) => (i === index ? value : opt)),
    });
  };

  const addOption = () => {
    setQuestion({
      ...question,
      options: [...question.options, ""],
    });
  };

  const removeOption = (index: number) => {
    if (question.options.length <= 2) return;
    setQuestion({
      ...question,
      options: question.options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="pt-4">
      {/* Title */}
      <TextField
        fullWidth
        label="Título de la pregunta"
        variant="standard"
        className="text-bold mb-4"
        value={question.title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />

      {/* Description */}
      <TextField
        fullWidth
        label="Descripción de la pregunta"
        variant="standard"
        className="text-normal mb-4"
        value={question.description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Tipo de selección</InputLabel>
        <Select
          value={question.type}
          onChange={(e) =>
            handleTypeChange(e.target.value as "single" | "multiple")
          }
        >
          <MenuItem value="single">Única</MenuItem>
          <MenuItem value="multiple">Múltiple</MenuItem>
        </Select>
      </FormControl>

      {question.options.map((option, index) => (
        <Box key={index} display="flex" alignItems="center" mb={1}>
          {question.type === "single" ? (
            <FormControlLabel
              control={<Radio disabled />}
              label=""
              className="mr-2"
            />
          ) : (
            <FormControlLabel
              control={<Checkbox disabled />}
              label=""
              className="mr-2"
            />
          )}
          <TextField
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Opción ${index + 1}`}
            fullWidth
            variant="standard"
          />
          <IconButton
            onClick={() => removeOption(index)}
            disabled={question.options.length <= 2} // mínimo 2 opciones
          >
            <Remove />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" startIcon={<Add />} onClick={addOption}>
        Agregar opción
      </Button>
    </div>
  );
}
