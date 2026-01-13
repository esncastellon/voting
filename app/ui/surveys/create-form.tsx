"use client";

import { RoleField } from "@/app/lib/survey/definitions";
import Link from "next/link";
import {
  HashtagIcon,
  LanguageIcon,
  CalendarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createPoll, State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import Input from "../input";
import TextInput from "../text-input";
import { UserField } from "@/app/lib/user/definitions";

export default function Form({
  roles,
  users,
}: {
  roles: RoleField[];
  users: UserField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createPoll, initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Title */}
        <Input
          id="title"
          label="Título de la votación"
          icon={
            <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="title"
            name="title"
            type="text"
            placeholder="Introduce el título de la votación"
          />
        </Input>

        {/* Description */}
        <Input
          id="description"
          label="Descripción de la votación"
          icon={
            <LanguageIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="description"
            name="description"
            type="text"
            placeholder="Introduce la descripción de la votación"
          />
        </Input>

        {/* Start Date */}
        <Input
          id="startDate"
          label="Fecha de inicio"
          icon={
            <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="startDate"
            name="startDate"
            type="date"
            placeholder="Introduce la fecha de inicio"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </Input>

        {/* End Date */}
        <Input
          id="endDate"
          label="Fecha de finalización"
          icon={
            <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          }
        >
          <TextInput
            id="endDate"
            name="endDate"
            type="date"
            placeholder="Introduce la fecha de finalización"
          />
        </Input>

        {/* Recipients */}
        <Input
          id="recipients"
          label="Selecciona los destinatarios"
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
            multiple
          >
            <option value="" disabled>
              Selecciona roles y/o usuarios
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <div id="role-error" aria-live="polite" aria-atomic="true">
            {state.errors?.title &&
              state.errors.title.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </Input>
        <div id="customer-error" aria-live="polite" aria-atomic="true">
          {state.errors?.recipients &&
            state.errors.recipients.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/surveys"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <Button type="submit">Crear Votación</Button>
      </div>
    </form>
  );
}
