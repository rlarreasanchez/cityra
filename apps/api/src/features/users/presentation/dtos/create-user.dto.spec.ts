import { UserRole } from "@cityra/domain";
import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto.js";

describe("CreateUserDto", () => {
  const validValues = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: UserRole.ADMIN,
  };

  async function getConstraints(
    property: keyof CreateUserDto,
    overrides: Partial<Record<keyof CreateUserDto, unknown>> = {}
  ): Promise<Record<string, string> | undefined> {
    const dto = Object.assign(new CreateUserDto(), validValues, overrides);
    const errors = await validate(dto);
    return errors.find((error) => error.property === property)?.constraints;
  }

  it("accepts a valid user", async () => {
    const dto = Object.assign(new CreateUserDto(), validValues);

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  describe("name", () => {
    it("is required", async () => {
      expect(await getConstraints("name", { name: undefined })).toHaveProperty(
        "isString"
      );
    });

    it("must be a string", async () => {
      expect(await getConstraints("name", { name: 42 })).toHaveProperty(
        "isString"
      );
    });

    it("must contain at least 2 characters", async () => {
      expect(await getConstraints("name", { name: "A" })).toHaveProperty(
        "minLength"
      );
    });

    it("must not exceed 100 characters", async () => {
      expect(
        await getConstraints("name", { name: "a".repeat(101) })
      ).toHaveProperty("maxLength");
    });

    it("accepts the minimum and maximum lengths", async () => {
      await expect(
        getConstraints("name", { name: "Al" })
      ).resolves.toBeUndefined();
      await expect(
        getConstraints("name", { name: "a".repeat(100) })
      ).resolves.toBeUndefined();
    });
  });

  describe("email", () => {
    it("is required", async () => {
      expect(
        await getConstraints("email", { email: undefined })
      ).toHaveProperty("isEmail");
    });

    it("must be a valid email address", async () => {
      expect(
        await getConstraints("email", { email: "not-an-email" })
      ).toHaveProperty("isEmail");
    });

    it("must not exceed 255 characters", async () => {
      expect(
        await getConstraints("email", { email: `a@${"b".repeat(250)}.com` })
      ).toHaveProperty("maxLength");
    });

    it("accepts a valid email address", async () => {
      await expect(
        getConstraints("email", { email: "user+tag@example.com" })
      ).resolves.toBeUndefined();
    });
  });

  describe("password", () => {
    it("is required", async () => {
      expect(
        await getConstraints("password", { password: undefined })
      ).toHaveProperty("isString");
    });

    it("must be a string", async () => {
      expect(
        await getConstraints("password", { password: 12345678 })
      ).toHaveProperty("isString");
    });

    it("must contain at least 8 characters", async () => {
      expect(
        await getConstraints("password", {
          password: "short",
          confirmPassword: "short",
        })
      ).toHaveProperty("minLength");
    });

    it("must not exceed 100 characters", async () => {
      const password = "a".repeat(101);
      expect(
        await getConstraints("password", {
          password,
          confirmPassword: password,
        })
      ).toHaveProperty("maxLength");
    });

    it("accepts the minimum and maximum lengths", async () => {
      await expect(
        getConstraints("password", {
          password: "a".repeat(8),
          confirmPassword: "a".repeat(8),
        })
      ).resolves.toBeUndefined();
      await expect(
        getConstraints("password", {
          password: "a".repeat(100),
          confirmPassword: "a".repeat(100),
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("confirmPassword", () => {
    it("is required", async () => {
      expect(
        await getConstraints("confirmPassword", { confirmPassword: undefined })
      ).toHaveProperty("isString");
    });

    it("must be a string", async () => {
      expect(
        await getConstraints("confirmPassword", { confirmPassword: 12345678 })
      ).toHaveProperty("isString");
    });

    it("must match the password", async () => {
      expect(
        await getConstraints("confirmPassword", {
          confirmPassword: "different123",
        })
      ).toHaveProperty(
        "matchesPassword",
        "La confirmación debe coincidir con la contraseña"
      );
    });

    it("accepts a confirmation matching the password", async () => {
      await expect(getConstraints("confirmPassword")).resolves.toBeUndefined();
    });
  });

  describe("role", () => {
    it("is required", async () => {
      expect(await getConstraints("role", { role: undefined })).toHaveProperty(
        "isEnum"
      );
    });

    it.each(Object.values(UserRole))("accepts the %s role", async (role) => {
      await expect(getConstraints("role", { role })).resolves.toBeUndefined();
    });

    it("rejects a role outside UserRole", async () => {
      expect(await getConstraints("role", { role: "UNKNOWN" })).toHaveProperty(
        "isEnum"
      );
    });
  });
});
