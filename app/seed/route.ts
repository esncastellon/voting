import bcrypt from "bcryptjs";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

type RoleSeed = {
  name: "admin" | "usuario" | "lector";
  description: string;
};

type UserSeed = {
  name: string;
  email: string;
  password: string;
  role: RoleSeed["name"];
};

type PollSeed = {
  title: string;
  description: string;
  question: string;
  status: "open" | "closed";
  options: string[];
};

const roles: RoleSeed[] = [
  { name: "admin", description: "Gestiona votaciones y usuarios" },
  { name: "usuario", description: "Puede votar en votaciones abiertas" },
  {
    name: "lector",
    description: "Puede consultar informacion sin modificarla",
  },
];

const users: UserSeed[] = [
  {
    name: "Admin Demo",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
  },
  {
    name: "Usuario Demo",
    email: "usuario@example.com",
    password: "123456",
    role: "usuario",
  },
  {
    name: "Lector Demo",
    email: "lector@example.com",
    password: "123456",
    role: "lector",
  },
];

const polls: PollSeed[] = [
  {
    title: "Eleccion de actividad",
    description: "Votacion de ejemplo para validar el flujo principal.",
    question: "Que actividad prefieres para la proxima reunion?",
    status: "open",
    options: ["Taller", "Cena", "Excursion"],
  },
  {
    title: "Horario preferido",
    description: "Votacion cerrada con resultados de ejemplo.",
    question: "Que horario encaja mejor?",
    status: "closed",
    options: ["Manana", "Tarde"],
  },
];

async function createSchema() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK (name IN ('admin', 'usuario', 'lector')),
      description TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '/users/default-avatar.svg',
      role_id UUID NOT NULL REFERENCES roles(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS polls (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      question TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
      starts_at TIMESTAMP,
      ends_at TIMESTAMP,
      created_by UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS poll_options (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      position INT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (poll_id, user_id)
    )
  `;
}

async function seedRoles() {
  const insertedRoles = await Promise.all(
    roles.map(
      (role) => sql<{ id: string; name: RoleSeed["name"] }[]>`
        INSERT INTO roles (name, description)
        VALUES (${role.name}, ${role.description})
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
        RETURNING id, name
      `,
    ),
  );

  return new Map(
    insertedRoles.flat().map((role) => [role.name, role.id] as const),
  );
}

async function ensureUserColumns(roleIds: Map<RoleSeed["name"], string>) {
  const defaultRoleId = roleIds.get("usuario");
  if (!defaultRoleId) {
    throw new Error("Default usuario role was not seeded.");
  }

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `;
  await sql`
    ALTER TABLE users
    ALTER COLUMN image_url SET DEFAULT '/users/default-avatar.svg'
  `;
  await sql`
    UPDATE users
    SET image_url = '/users/default-avatar.svg'
    WHERE image_url IS NULL
  `;
  await sql`
    ALTER TABLE users
    ALTER COLUMN image_url SET NOT NULL
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role_id UUID
  `;
  await sql`
    UPDATE users
    SET role_id = ${defaultRoleId}
    WHERE role_id IS NULL
  `;
  await sql`
    ALTER TABLE users
    ALTER COLUMN role_id SET NOT NULL
  `;
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_id_fkey'
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES roles(id);
      END IF;
    END $$;
  `;
}

async function seedUsers(roleIds: Map<RoleSeed["name"], string>) {
  const seededUsers = [];

  for (const user of users) {
    const roleId = roleIds.get(user.role);
    if (!roleId) {
      throw new Error(`Role ${user.role} was not seeded.`);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const inserted = await sql<{ id: string; email: string }[]>`
      INSERT INTO users (name, email, password, role_id, image_url)
      VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${roleId}, '/users/default-avatar.svg')
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role_id = EXCLUDED.role_id,
        image_url = EXCLUDED.image_url
      RETURNING id, email
    `;

    seededUsers.push(inserted[0]);
  }

  return seededUsers;
}

async function seedPolls(adminUserId: string, voterUserId: string) {
  const seededPolls = [];

  for (const poll of polls) {
    const existingPoll =
      (
        await sql<{ id: string; status: PollSeed["status"] }[]>`
          SELECT id, status FROM polls WHERE title = ${poll.title} LIMIT 1
        `
      )[0] ??
      (
        await sql<{ id: string; status: PollSeed["status"] }[]>`
          INSERT INTO polls (title, description, question, status, created_by)
          VALUES (${poll.title}, ${poll.description}, ${poll.question}, ${poll.status}, ${adminUserId})
          RETURNING id, status
        `
      )[0];

    if (!existingPoll) {
      continue;
    }

    await sql`
      UPDATE polls
      SET
        description = ${poll.description},
        question = ${poll.question},
        status = ${poll.status},
        created_by = ${adminUserId},
        updated_at = NOW()
      WHERE id = ${existingPoll.id}
    `;
    await sql`DELETE FROM votes WHERE poll_id = ${existingPoll.id}`;
    await sql`DELETE FROM poll_options WHERE poll_id = ${existingPoll.id}`;

    const insertedOptions = [];
    for (const [position, label] of poll.options.entries()) {
      const option = await sql<{ id: string }[]>`
        INSERT INTO poll_options (poll_id, label, position)
        VALUES (${existingPoll.id}, ${label}, ${position})
        RETURNING id
      `;
      insertedOptions.push(option[0]);
    }

    if (poll.status === "closed" && insertedOptions[0]) {
      await sql`
        INSERT INTO votes (poll_id, option_id, user_id)
        VALUES (${existingPoll.id}, ${insertedOptions[0].id}, ${voterUserId})
        ON CONFLICT (poll_id, user_id) DO NOTHING
      `;
    }

    seededPolls.push(existingPoll);
  }

  return seededPolls;
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ message: "No encontrado" }, { status: 404 });
  }

  try {
    await createSchema();

    const roleIds = await seedRoles();
    await ensureUserColumns(roleIds);
    const seededUsers = await seedUsers(roleIds);
    const admin = seededUsers.find((user) => user.email === "admin@example.com");
    const voter = seededUsers.find(
      (user) => user.email === "usuario@example.com",
    );

    if (!admin || !voter) {
      throw new Error("Demo users were not seeded.");
    }

    const seededPolls = await seedPolls(admin.id, voter.id);

    return Response.json({
      message: "Database seeded successfully",
      roles: roles.length,
      users: seededUsers.length,
      polls: seededPolls.length,
    });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
