"use client";

import { RoleField } from "@/app/lib/user/definitions";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { SurveyField } from "@/app/lib/survey/definitions";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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
  survey,
  setSurvey,
}: {
  roles: RoleField[];
  survey: SurveyField;
  setSurvey: React.Dispatch<React.SetStateAction<SurveyField>>;
}) {
  const handleRecipientsChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    const recipientsList = typeof value === "string" ? value.split(",") : value;
    setSurvey((prev) => ({ ...prev, recipients: recipientsList }));
  };

  const handleStartDateChange = (date: Date) => {
    setSurvey((prev) => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date: Date) => {
    setSurvey((prev) => ({ ...prev, endDate: date }));
  };
  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start Date */}
        <DatePicker
          label="Fecha de inicio"
          name="startDate"
          value={survey.startDate || null}
          onChange={handleStartDateChange}
        />

        {/* End Date */}
        <DatePicker
          label="Fecha de finalización"
          name="endDate"
          value={survey.endDate || null}
          onChange={handleEndDateChange}
        />

        {/* Recipients */}
        <FormControl fullWidth>
          <InputLabel id="recipients-label">
            Selecciona los destinatarios
          </InputLabel>
          <Select
            id="recipients"
            name="recipients"
            multiple
            value={survey.recipients}
            input={<OutlinedInput label="Selecciona los destinatarios" />}
            renderValue={(selected) =>
              selected
                .map((id) => roles.find((role) => role.id === id)?.name)
                .filter(Boolean)
                .join(", ")
            }
            MenuProps={MenuProps}
            onChange={handleRecipientsChange}
            labelId="recipients-label"
            IconComponent={AccountCircleOutlinedIcon}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                <Checkbox
                  checked={survey.recipients?.includes(role.id) || false}
                />
                <ListItemText primary={role.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </LocalizationProvider>
    </div>
  );
}
