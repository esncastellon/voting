import postgres from "postgres";
import { RoleField, UserField, UsersTableType } from "../user/definitions";
import { Role } from "firebase/ai";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

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

const ITEMS_PER_PAGE = 6;

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

export async function fetchUsersByRole(roleId: string) {
  try {
    const users = await sql<UserField[]>`
      SELECT
        id,
        name
      FROM users
      WHERE role_id = ${roleId}
      ORDER BY name ASC
    `;

    return users;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch users by role.");
  }
}
