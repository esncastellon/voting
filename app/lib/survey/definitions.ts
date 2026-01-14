// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestPollsRaw = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
};

export type SurveysTable = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  name: string;
  image_url: string;
  status: "pendiente" | "activa" | "cerrada";
};

export type SurveyField = {
  id?: string;
  title: string;
  description: string;
  created_at?: string;
  created_by?: string;
  startDate: Date | null;
  endDate: Date | null;
  recipients?: string[];
  status?: "pendiente" | "activa" | "cerrada";
  questions: QuestionField[];
};

export type QuestionField = {
  id?: string;
  title: string;
  description: string;
  type: "single" | "multiple";
  options: OptionField[];
  position: number;
};

export type OptionField = {
  id?: string;
  question_id?: string;
  name: string;
  position: number;
};
