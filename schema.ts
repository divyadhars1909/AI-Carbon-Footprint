import { z } from "zod";
import { insertEmissionSchema, emissions } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  emissions: {
    create: {
      method: "POST" as const,
      path: "/api/emissions" as const,
      input: insertEmissionSchema,
      responses: {
        201: z.custom<typeof emissions.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/emissions" as const,
      responses: {
        200: z.array(z.custom<typeof emissions.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type EmissionInput = z.infer<typeof api.emissions.create.input>;
export type EmissionResponse = z.infer<typeof api.emissions.create.responses[201]>;
export type EmissionsListResponse = z.infer<typeof api.emissions.list.responses[200]>;
export type ValidationError = z.infer<typeof errorSchemas.validation>;
