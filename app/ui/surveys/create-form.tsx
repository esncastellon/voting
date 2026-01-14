"use client";

import { RoleField } from "@/app/lib/user/definitions";
import { createSurvey, State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import { UserField } from "@/app/lib/user/definitions";
import HorizontalLinearStepper from "./stepper";

export default function Form({
  roles,
  users,
}: {
  roles: RoleField[];
  users: UserField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createSurvey, initialState);

  return (
    <form action={formAction}>
      <HorizontalLinearStepper users={users} roles={roles} />
    </form>
  );
}
