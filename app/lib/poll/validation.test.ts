import { describe, expect, test } from "vitest";
import { validatePollInput } from "./validation";

describe("validatePollInput", () => {
  test("accepts a poll with a title, question, status, and two options", () => {
    const result = validatePollInput({
      title: "Junta 2026",
      description: "Votacion de prueba",
      question: "Que opcion prefieres?",
      status: "open",
      starts_at: null,
      ends_at: null,
      options: [
        { label: "Opcion A", position: 3 },
        { label: "Opcion B", position: 1 },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.options).toEqual([
        { label: "Opcion B", position: 0 },
        { label: "Opcion A", position: 1 },
      ]);
    }
  });

  test("rejects polls with fewer than two non-empty options", () => {
    const result = validatePollInput({
      title: "Junta 2026",
      description: "",
      question: "Que opcion prefieres?",
      status: "draft",
      starts_at: null,
      ends_at: null,
      options: [{ label: "Opcion A", position: 0 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.options?.[0]).toContain(
        "La votacion necesita al menos dos opciones.",
      );
    }
  });
});
