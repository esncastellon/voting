import postgres from "postgres";
import {
  LatestSurveysRaw,
  OptionField,
  QuestionField,
  SurveyField,
  SurveysTable,
} from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchLatestSurveys() {
  try {
    const data = await sql<LatestSurveysRaw[]>`
      SELECT surveys.id, surveys.title, surveys.description, surveys.created_at, surveys.created_by, 
        surveys.start_date, surveys.end_date, surveys.status
      FROM surveys
      JOIN users ON surveys.created_by = users.id
      ORDER BY surveys.start_date DESC
      LIMIT 5`;

    const latestSurveys = data.map((survey) => ({
      ...survey,
    }));
    return latestSurveys;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest surveys.");
  }
}

export async function fetchCardData() {
  try {
    const surveysCountPromise = sql`SELECT COUNT(*) FROM surveys WHERE start_date <= NOW() AND end_date >= NOW()`;
    const assembliesCountPromise = sql`SELECT COUNT(*) FROM assemblies WHERE start_date >= NOW()`;
    const memberCountPromise = sql`SELECT COUNT(*) FROM users WHERE role_id in (1, 2)`;
    const collaboratorCountPromise = sql`SELECT COUNT(*) FROM users WHERE role_id = 3`;

    const data = await Promise.all([
      surveysCountPromise,
      assembliesCountPromise,
      memberCountPromise,
      collaboratorCountPromise,
    ]);

    const numberOfSurveys = Number(data[0][0].count ?? "0");
    const numberOfAssemblies = Number(data[1][0].count ?? "0");
    const numberOfMembers = Number(data[2][0].count ?? "0");
    const numberOfCollaborators = Number(data[3][0].count ?? "0");
    return {
      numberOfSurveys,
      numberOfAssemblies,
      numberOfMembers,
      numberOfCollaborators,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredSurveys(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<SurveysTable[]>`
      SELECT 
        surveys.id,
        surveys.title,
        surveys.description,
        surveys.created_at,
        surveys.created_by,
        users.name,
        users.image_url,
        surveys.start_date,
        surveys.end_date
      FROM surveys
      JOIN users ON surveys.created_by = users.id
      WHERE
        users.name ILIKE ${`%${query}%`} OR
        surveys.title ILIKE ${`%${query}%`} OR
        surveys.description ILIKE ${`%${query}%`}
      ORDER BY surveys.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch surveys.");
  }
}

export async function fetchSurveysPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM surveys
    JOIN users ON surveys.created_by = users.id
    WHERE
      users.name ILIKE ${`%${query}%`} OR
      surveys.title ILIKE ${`%${query}%`} OR
      surveys.description ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of surveys.");
  }
}

export async function fetchSurveyById(id: string) {
  try {
    const data = await sql<SurveysTable[]>`
      SELECT 
        surveys.id,
        surveys.title,
        surveys.description,
        surveys.created_at,
        surveys.created_by,
        users.name,
        users.image_url,
        surveys.start_date
      FROM surveys
      JOIN users ON surveys.created_by = users.id
      WHERE surveys.id = ${id}
    `;

    return data[0] || null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch survey by ID.");
  }
}

export async function fetchSurveyDetailsById(id: string): Promise<SurveyField> {
  try {
    const surveyData: SurveyField[] = await sql`
      SELECT
        id,
        title,
        description,
        created_at,
        start_date,
        end_date,
        status
      FROM surveys
      WHERE id = ${id}
    `;

    if (surveyData.length === 0) {
      return new Error("Survey not found.") as unknown as SurveyField;
    }

    const questionsData: QuestionField[] = await sql`
      SELECT
        id,
        title,
        description,
        case type
          when 1 then 'single'
          when 2 then 'multiple'
        end as type,
        position
      FROM survey_questions
      WHERE survey_id = ${id}
      ORDER BY position ASC
    `;

    for (const question of questionsData) {
      const optionsData: OptionField[] = await sql`
        SELECT
          id,
          name,
          position
        FROM survey_options
        WHERE question_id = ${question.id}
        ORDER BY position ASC
      `;
      question.options = optionsData;
    }

    const recipientsData: { user_id: string }[] = await sql`
      SELECT
        user_id
      FROM surveys_users
      WHERE survey_id = ${id}
    `;

    surveyData[0].recipients = recipientsData.map(
      (recipient) => recipient.user_id
    );

    const surveyDetails: SurveyField = {
      ...surveyData[0],
      questions: questionsData,
    };

    return surveyDetails;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch survey details by ID.");
  }
}
