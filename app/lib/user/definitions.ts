import type { RoleName } from "@/app/lib/poll/definitions";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  image_url: string;
  role_id: string;
  role_name: RoleName;
};

export type UsersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  role: RoleName;
};

export type UserField = {
  id: string;
  name: string;
};

export type RoleField = {
  id: string;
  name: RoleName;
};

export type UsersRoleField = {
  role_id: string;
  role_name: RoleName;
  user_id: string | null;
  user_name: string | null;
};
