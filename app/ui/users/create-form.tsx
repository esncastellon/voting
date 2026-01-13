"use client";

import { RoleField } from "@/app/lib/user/definitions";
import Link from "next/link";
import {
  UserCircleIcon,
  AtSymbolIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createUser, State } from "@/app/lib/user/actions";
import { useActionState } from "react";
import Input from "../input";
import TextInput from "../text-input";

export default function Form({ roles }: { roles: RoleField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createUser, initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Full Name */}
        <Input
          id="name"
          label="Nombre completo"
          icon={
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="name"
            name="name"
            type="text"
            placeholder="Introduce el nombre completo"
          />
        </Input>

        {/* Email */}
        <Input
          id="email"
          label="Email"
          icon={
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="email"
            name="email"
            type="email"
            placeholder="Introduce el email"
          />
        </Input>

        {/* Role Name */}
        <Input
          id="roleId"
          label="Elige su rol"
          icon={
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <select
            id="roleId"
            name="roleId"
            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            defaultValue=""
            aria-describedby="role-error"
          >
            <option value="" disabled>
              Selecciona un rol
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <div id="role-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </Input>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/users"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <Button type="submit">Crear Usuario</Button>
      </div>
    </form>
  );
}
