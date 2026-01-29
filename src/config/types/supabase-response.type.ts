export type SupabaseResponse<T> =
  | {
      status: "success";
      data: T;
      error: null;
      message?: string;
      code?: string;
    }
  | {
      status: "error";
      data: null;
      error: string;
      message?: string;
      code?: string;
    };

export const success = <T>(
  data: T,
  message?: string
): SupabaseResponse<T> => ({
  status: "success",
  data,
  error: null,
  message,
});

export const failure = (
  error: string,
  message?: string,
  code?: string
): SupabaseResponse<never> => ({
  status: "error",
  data: null,
  error,
  message,
  code,
});
