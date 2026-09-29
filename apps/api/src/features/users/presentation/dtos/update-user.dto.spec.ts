import { UserRole } from "@cityra/domain";
import { validate } from "class-validator";
import { UpdateUserDto } from "./update-user.dto.js";

describe("UpdateUserDto", () => {
  async function getConstraints(
    property: keyof UpdateUserDto,
    values: Partial<Record<keyof UpdateUserDto, unknown>> = {}
  ): Promise<Record<string, string> | undefined> {
    const dto = Object.assign(new UpdateUserDto(), values);
    const errors = await validate(dto);
    return errors.find((error) => error.property === property)?.constraints;
  }

  it("accepts an empty update", async () => {
    await expect(validate(new UpdateUserDto())).resolves.toHaveLength(0);
  });

  describe("name", () => {
    it("must be a string", async () => {
      expect(await getConstraints("name", { name: 42 })).toHaveProperty(
        "isString",
        "El nombre debe ser una cadena de texto"
      );
    });

    it("must contain at least 2 characters", async () => {
      expect(await getConstraints("name", { name: "A" })).toHaveProperty(
        "minLength",
        "El nombre debe tener al menos 2 caracteres"
      );
    });

    it("must not exceed 100 characters", async () => {
      expect(
        await getConstraints("name", { name: "a".repeat(101) })
      ).toHaveProperty(
        "maxLength",
        "El nombre debe tener como máximo 100 caracteres"
      );
    });

    it("accepts a valid name", async () => {
      await expect(
        getConstraints("name", { name: "Ada Lovelace" })
      ).resolves.toBeUndefined();
    });
  });

  describe("email", () => {
    it("must be a valid email address", async () => {
      expect(
        await getConstraints("email", { email: "invalid-email" })
      ).toHaveProperty(
        "isEmail",
        "El email debe ser una dirección de correo electrónico válida"
      );
    });

    it("must not exceed 255 characters", async () => {
      expect(
        await getConstraints("email", { email: `a@${"b".repeat(250)}.com` })
      ).toHaveProperty(
        "maxLength",
        "El email debe tener como máximo 255 caracteres"
      );
    });

    it("accepts a valid email address", async () => {
      await expect(
        getConstraints("email", { email: "user+tag@example.com" })
      ).resolves.toBeUndefined();
    });
  });

  describe("password", () => {
    it("must be a string", async () => {
      expect(
        await getConstraints("password", { password: 12345678 })
      ).toHaveProperty(
        "isString",
        "La contraseña debe ser una cadena de texto"
      );
    });

    it("must contain at least 8 characters", async () => {
      expect(
        await getConstraints("password", {
          password: "short",
          confirmPassword: "short",
        })
      ).toHaveProperty(
        "minLength",
        "La contraseña debe tener al menos 8 caracteres"
      );
    });

    it("must not exceed 100 characters", async () => {
      const password = "a".repeat(101);
      expect(
        await getConstraints("password", {
          password,
          confirmPassword: password,
        })
      ).toHaveProperty(
        "maxLength",
        "La contraseña debe tener como máximo 100 caracteres"
      );
    });

    it("accepts a valid password when the confirmation matches", async () => {
      const password = "password123";
      const dto = Object.assign(new UpdateUserDto(), {
        password,
        confirmPassword: password,
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
    });
  });

  describe("confirmPassword", () => {
    it("is optional when password is omitted", async () => {
      await expect(
        validate(Object.assign(new UpdateUserDto(), { name: "Ada" }))
      ).resolves.toHaveLength(0);
    });

    it("is required when password is provided", async () => {
      expect(
        await getConstraints("confirmPassword", { password: "password123" })
      ).toHaveProperty(
        "isString",
        "La confirmación de contraseña debe ser una cadena de texto"
      );
    });

    it("must be a string when password is provided", async () => {
      expect(
        await getConstraints("confirmPassword", {
          password: "password123",
          confirmPassword: 12345678,
        })
      ).toHaveProperty(
        "isString",
        "La confirmación de contraseña debe ser una cadena de texto"
      );
    });

    it("must match the password", async () => {
      expect(
        await getConstraints("confirmPassword", {
          password: "password123",
          confirmPassword: "different123",
        })
      ).toHaveProperty(
        "matchesPassword",
        "La confirmación debe coincidir con la contraseña"
      );
    });
  });

  describe("role", () => {
    it("accepts a valid role", async () => {
      await expect(
        getConstraints("role", { role: UserRole.TECHNICIAN })
      ).resolves.toBeUndefined();
    });

    it("rejects a role outside UserRole", async () => {
      expect(await getConstraints("role", { role: "UNKNOWN" })).toHaveProperty(
        "isEnum",
        "El rol no es válido"
      );
    });
  });

  describe("isActive", () => {
    it("must be a boolean", async () => {
      expect(
        await getConstraints("isActive", { isActive: "true" })
      ).toHaveProperty("isBoolean", "isActive debe ser un valor booleano");
    });

    it("accepts a boolean", async () => {
      await expect(
        getConstraints("isActive", { isActive: false })
      ).resolves.toBeUndefined();
    });
  });
});
