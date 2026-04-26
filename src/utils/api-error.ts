import { IApiError } from "@/api/http";

type ApiErrorLike = Partial<IApiError> & {
  message?: unknown;
  error?: unknown;
};

const stringifyErrorValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(stringifyErrorValue).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return "";
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error && typeof error === "object") {
    const apiError = error as ApiErrorLike;
    const detail = stringifyErrorValue(apiError.detail);
    const message = stringifyErrorValue(apiError.message);
    const errorMessage = stringifyErrorValue(apiError.error);

    return detail || message || errorMessage || fallback;
  }

  return fallback;
};
