import postgres from "postgres";
import {
  InvoiceForm,
  InvoicesTable,
  LatestPollsRaw,
  Revenue,
  RoleField,
  SurveysTable,
  UserField,
  UsersTableType,
} from "../user/definitions";
import { formatCurrency } from "../user/utils";
import { Role } from "firebase/ai";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

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
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

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
        users.image_url
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

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
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

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchUsers() {
  try {
    const users = await sql<UserField[]>`
      SELECT
        id,
        name
      FROM users
      ORDER BY name ASC
    `;

    return users;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchRoles() {
  try {
    const roles = await sql<RoleField[]>`
      SELECT
        id,
        name
      FROM roles
      ORDER BY name ASC
    `;

    return roles;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all roles.");
  }
}

export async function fetchFilteredCustomers(
  query: string,
  currentPage: number
) {
  try {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const data = await sql<UsersTableType[]>`
		SELECT
		  users.id,
		  users.name,
		  users.email,
		  users.image_url,
		  roles.name AS role
		FROM users
		JOIN roles ON users.role_id = roles.id
		WHERE
		  users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`}
		GROUP BY users.id, users.name, users.email, users.image_url, roles.name
		ORDER BY users.name ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	  `;

    const customers = data.map((customer) => ({
      ...customer,
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchCustomersPages(query: string) {
  try {
    const data = await sql`
		SELECT COUNT(*) 
    FROM users
		WHERE
		  users.name ILIKE ${`%${query}%`} OR
        users.email ILIKE ${`%${query}%`}
		GROUP BY users.id, users.name, users.email, users.image_url
		ORDER BY users.name ASC
	  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch total number of customers.");
  }
}
