import { z } from "zod";
import type { CloudLoggingApi } from "../domain/api";
import type { LogCache } from "../domain/cache";

const inputSchema = z.object({
  projectId: z.string(),
  logId: z.string(),
});

const outputSchema = z.string();

export type GetLogDetailInput = z.infer<typeof inputSchema>;
type GetLogDetailOutput = z.infer<typeof outputSchema>;

export const getLogDetailTool = (dependencies: {
  api: CloudLoggingApi;
  cache: LogCache;
}) => {
  return {
    name: "getLogDetail",
    description: "Returns the whole record of a log with the given ID",
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    handler: async (input: GetLogDetailInput): Promise<GetLogDetailOutput> => {
      return JSON.stringify(input);
    },
  };
};
