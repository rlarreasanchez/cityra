/**
 * 🔐 Utilidad para sanitizar datos sensibles antes de loguearlos
 * Previene exposición accidental de información sensible en logs
 * CWE-532: Insertion of Sensitive Information into Log File
 */

/**
 * Claves consideradas sensibles que deben ser redactadas
 */
const SENSITIVE_KEYS = [
  // Autenticación y seguridad
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "api_key",
  "authorization",
  "auth",
  "bearer",
  "session",
  "sessionid",
  "cookie",
  "csrf",
  "xsrf",

  // Información personal (PII)
  "email",
  "mail",
  "phone",
  "telephone",
  "mobile",
  "ssn",
  "dni",
  "nif",
  "passport",
  "creditcard",
  "cardnumber",
  "cvv",
  "pin",

  // Claves de encriptación
  "key",
  "privatekey",
  "publickey",
  "encryptionkey",
  "salt",
  "iv",
  "cipher",

  // Datos bancarios
  "iban",
  "swift",
  "accountnumber",
  "routingnumber",
];

/**
 * Patrones sensibles en el contenido de strings (regex)
 */
const SENSITIVE_PATTERNS = [
  // Tokens JWT (formato estándar)
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,

  // Claves de API (formatos comunes)
  /[a-zA-Z0-9]{32,}/g, // Claves largas alfanuméricas

  // IBANs
  /[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}/g,

  // Tarjetas de crédito (4 grupos de 4 dígitos)
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // Emails
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Números de teléfono (varios formatos internacionales)
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
];

/**
 * Sanitiza un valor individual reemplazando información sensible
 */
function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // Si es un string, aplicar patrones sensibles
  if (typeof value === "string") {
    let sanitized = value;

    // Reemplazar patrones sensibles
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }

    return sanitized;
  }

  // Si es un objeto o array, recursión
  if (typeof value === "object") {
    return sanitizeForLog(value);
  }

  // Números, booleanos, etc. -> devolver tal cual
  return value;
}

/**
 * Sanitiza un objeto o array de forma recursiva
 * Reemplaza valores de claves sensibles con [REDACTED]
 * @param obj - Objeto a sanitizar
 * @returns Objeto sanitizado (copia limpia)
 */
export function sanitizeForLog(obj: unknown): unknown {
  // Null o undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Primitivos (string, number, boolean)
  if (typeof obj !== "object") {
    return sanitizeValue(obj);
  }

  // Instancias de Error
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: sanitizeValue(obj.message),
      // No incluir stack trace en logs sanitizados (ya manejado por exceptions.filter.ts)
    };
  }

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForLog(item));
  }

  // Objetos
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const keyLower = key.toLowerCase();

    // Si la clave es sensible, redactar
    if (SENSITIVE_KEYS.some((sk) => keyLower.includes(sk))) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    // Si el valor es un objeto/array, recursión
    sanitized[key] = sanitizeValue(value);
  }

  return sanitized;
}

/**
 * Sanitiza un mensaje de error manteniendo información útil para debugging
 * Remueve información sensible pero mantiene contexto del error
 * @param error - Error o mensaje a sanitizar
 * @returns Mensaje sanitizado
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return "Error desconocido";
  }

  // Si es un objeto Error
  if (error instanceof Error) {
    let message = error.message;

    // Aplicar patrones sensibles
    for (const pattern of SENSITIVE_PATTERNS) {
      message = message.replace(pattern, "[REDACTED]");
    }

    return message;
  }

  // Si es un string
  if (typeof error === "string") {
    let message = error;

    for (const pattern of SENSITIVE_PATTERNS) {
      message = message.replace(pattern, "[REDACTED]");
    }

    return message;
  }

  // Si es un objeto
  if (typeof error === "object") {
    try {
      const sanitized = sanitizeForLog(error);
      return JSON.stringify(sanitized);
    } catch {
      return "Error al serializar error";
    }
  }

  return String(error);
}

/**
 * Trunca valores largos para evitar logs excesivamente largos
 * @param value - Valor a truncar
 * @param maxLength - Longitud máxima (default: 200)
 * @returns Valor truncado
 */
export function truncateLongValues(value: unknown, maxLength = 200): unknown {
  if (typeof value === "string" && value.length > maxLength) {
    return `${value.substring(0, maxLength)}... [truncado ${value.length - maxLength} caracteres]`;
  }

  if (Array.isArray(value) && value.length > 50) {
    return [
      ...value.slice(0, 50),
      `... [truncado ${value.length - 50} elementos más]`,
    ];
  }

  return value;
}
