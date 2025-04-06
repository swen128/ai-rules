import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CloudLoggingApi } from "../domain/api";
import type { LogCache } from "../domain/cache";
import { getLogDetail } from "../domain/get-log-detail";

const inputSchema = z.object({
  projectId: z.string(),
  logId: z.string(),
});

export type GetLogDetailInput = z.infer<typeof inputSchema>;

export const getLogDetailTool = (dependencies: {
  api: CloudLoggingApi;
  cache: LogCache;
}): Tool<typeof inputSchema> => {
  return {
    name: "getLogDetail",
    description: "Returns the whole record of a log with the given ID",
    inputSchema: inputSchema,
    handler: async ({ input }: { input: GetLogDetailInput }) => {
      return {
        content: [
          {
            type: "text" as const,
            text: getLogDetail(dependencies)(input),
          },
        ],
      };
    },
  };
};

// TODO: This type is shared between the tools. Consider moving it to a common location.
type Tool<InputSchema extends z.ZodTypeAny> = {
  name: string;
  description: string;
  inputSchema: InputSchema;
  handler: ToolCallback<{ input: InputSchema }>;
};
