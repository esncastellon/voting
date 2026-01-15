import postgres from "postgres";
import {
  RoleField,
  UserField,
  UsersRoleField,
  UsersTableType,
} from "../user/definitions";
import { TreeNode } from "@/app/ui/commons/treeSelect";

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

export async function fetchRolesWithUsers() {
  try {
    const usersRole = await sql<UsersRoleField[]>`
      SELECT
        roles.id AS role_id,
        roles.name AS role_name,
        users.id AS user_id,
        users.name AS user_name
      FROM roles
      RIGHT JOIN users ON users.role_id = roles.id
      ORDER BY roles.name ASC, users.name ASC
    `;

    const map = new Map<string, TreeNode>();

    for (const row of usersRole) {
      if (!map.has(row.role_id)) {
        map.set(row.role_id, {
          id: row.role_id + "",
          label: row.role_name,
          children: [],
        });
      }

      if (row.user_id) {
        map.get(row.role_id)!.children!.push({
          id: row.user_id,
          label: row.user_name!,
        });
      }
    }

    return Array.from(map.values());
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch users with roles.");
  }
}
