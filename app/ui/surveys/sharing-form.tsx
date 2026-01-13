"use client";

import { RoleField } from "@/app/lib/user/definitions";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { createPoll, State } from "@/app/lib/survey/actions";
import { useActionState } from "react";
import Input from "../input";
import TextInput from "../text-input";
import { UserField } from "@/app/lib/user/definitions";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function SharingForm({
  roles,
  users,
}: {
  roles: RoleField[];
  users: UserField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createPoll, initialState);
  const [recipients, setRecipients] = React.useState<string[]>([]);

  const handleRecipientsChange = (
    event: SelectChangeEvent<typeof recipients>
  ) => {
    const {
      target: { value },
    } = event;
    setRecipients(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
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
      <FormControl fullWidth>
        <InputLabel id="recipients-label">
          Selecciona los destinatarios
        </InputLabel>
        <Select
          id="recipients"
          name="recipients"
          multiple
          value={recipients}
          input={<OutlinedInput label="Selecciona los destinatarios" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
          onChange={handleRecipientsChange}
          labelId="recipients-label"
          IconComponent={AccountCircleOutlinedIcon}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.name}>
              <Checkbox checked={recipients.includes(role.name)} />
              <ListItemText primary={role.name} />
            </MenuItem>
          ))}
          {users.map((user) => (
            <MenuItem key={user.id} value={user.name}>
              <Checkbox checked={recipients.includes(user.name)} />
              <ListItemText primary={user.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors?.recipients &&
          state.errors.recipients.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
    </div>
  );
}
