import { z } from "zod";
import { LogCache } from "../domain/cache";
import { CloudLoggingApi } from "../domain/api";

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
