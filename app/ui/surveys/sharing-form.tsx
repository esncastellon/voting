"use client";

import Select from "@mui/material/Select";
import React from "react";
import { SurveyField } from "@/app/lib/survey/definitions";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TreeNode } from "../commons/treeSelect";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { FormControl, InputLabel } from "@mui/material";
import { useApplyPropagationToSelectedItemsOnMount } from "@mui/x-tree-view/hooks";

const selectionPropagation = { parents: true, descendants: true };

dayjs.extend(utc);
dayjs.extend(timezone);

export default function SharingForm({
  rolesWithUsers,
  survey,
  setSurvey,
  readOnly = false,
}: {
  rolesWithUsers: TreeNode[];
  survey: SurveyField;
  setSurvey: React.Dispatch<React.SetStateAction<SurveyField>>;
  readOnly?: boolean;
}) {
  const initialSelectedItems = useApplyPropagationToSelectedItemsOnMount({
    items: rolesWithUsers,
    selectionPropagation,
    selectedItems: survey.recipients || [],
  });

  const [selectedItems, setSelectedItems] =
    React.useState(initialSelectedItems);

  const handleStartDateChange = (value: Dayjs | null) => {
    if (value) {
      const local = value.tz("Europe/Madrid", true);
      setSurvey((prev) => ({
        ...prev,
        start_date: local,
      }));
    } else {
      setSurvey((prev) => ({
        ...prev,
        start_date: null,
      }));
    }
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    if (value) {
      const local = value.tz("Europe/Madrid", true);
      setSurvey((prev) => ({
        ...prev,
        end_date: local,
      }));
    } else {
      setSurvey((prev) => ({
        ...prev,
        end_date: null,
      }));
    }
  };

  const handleRecipientsChange = (
    event: React.SyntheticEvent | null,
    newSelectedItems: string[],
  ) => {
    setSelectedItems(newSelectedItems);
    setSurvey((prev) => ({
      ...prev,
      recipients: newSelectedItems.filter((id) => isNaN(Number(id))),
    }));
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start Date */}
        <DateTimePicker
          label="Fecha de inicio"
          name="startDate"
          value={survey.start_date}
          onChange={handleStartDateChange}
          disabled={readOnly}
          format="DD/MM/YYYY HH:mm"
        />

        {/* End Date */}
        <DateTimePicker
          label="Fecha de finalización"
          name="endDate"
          value={survey.end_date}
          onChange={handleEndDateChange}
          format="DD/MM/YYYY HH:mm"
        />

        {/* Recipients */}
        <FormControl fullWidth>
          <InputLabel id="multi-label">Selecciona los destinatarios</InputLabel>
          <Select
            multiple
            value={survey.recipients || []}
            fullWidth
            label="Selecciona los destinatarios"
            labelId="multi-label"
            disabled={readOnly}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const findItem = (items: TreeNode[]): string | null => {
                    for (const item of items) {
                      if (item.id === id) return item.label;
                      if (item.children) {
                        const childResult = findItem(item.children);
                        if (childResult) return childResult;
                      }
                    }
                    return null;
                  };
                  return findItem(rolesWithUsers);
                })
                .filter(Boolean)
                .join(", ")
            }
          >
            <RichTreeView
              items={rolesWithUsers}
              checkboxSelection
              multiSelect
              selectionPropagation={selectionPropagation}
              selectedItems={selectedItems}
              onSelectedItemsChange={handleRecipientsChange}
            />
          </Select>
        </FormControl>
      </LocalizationProvider>
    </div>
  );
}
