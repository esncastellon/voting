import postgres from "postgres";
import {
  LatestPollsRaw,
  OptionField,
  QuestionField,
  SurveyField,
  SurveysTable,
} from "./definitions";
import { formatCurrency } from "./utils";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchLatestPolls() {
  try {
    const data = await sql<LatestPollsRaw[]>`
      SELECT polls.id, polls.title, polls.description, polls.created_at, polls.created_by
      FROM polls
      JOIN users ON polls.user_id = users.id
      ORDER BY polls.date DESC
      LIMIT 5`;

    const latestPolls = data.map((poll) => ({
      ...poll,
    }));
    return latestPolls;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest polls.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfCustomers = Number(data[1][0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
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
        surveys.start_date
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
