import { describe, expect, test } from "vitest";
import { comparePassword, hashPassword } from "./password";

describe("password helpers", () => {
  test("hashes a password and verifies the original value", async () => {
    const hash = await hashPassword("123456");

    expect(hash).not.toBe("123456");
    await expect(comparePassword("123456", hash)).resolves.toBe(true);
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });
});
