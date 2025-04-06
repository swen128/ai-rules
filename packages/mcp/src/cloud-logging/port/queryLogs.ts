import {z} from "zod";
import type {CloudLoggingApi} from "../domain/api";
import type {LogCache} from "../domain/cache";
import type {ToolCallback} from "@modelcontextprotocol/sdk/server/mcp.js";
import {queryLogs} from "../domain/query-logs";

const inputSchema = z.object({
  projectId: z.string(),
  filter: z.string(),
  resourceNames: z
    .array(
      z.string({
        description: "e.g. 'projects/<project_id>/logs/run.googleapis.com%2Fstdout'",
      }),
    )
    .optional(),
  pageSize: z.number().optional(),
  pageToken: z.string().optional(),
  orderBy: z
    .object({
      timestamp: z.enum(["asc", "desc"]),
    })
    .optional(),
  summaryFields: z
    .array(
      z.string({
        description: "Fields to include in the summary, e.g. ['labels.service', 'textPayload']",
      }),
    )
    .optional(),
});

const outputSchema = z.object({
  logs: z.array(
    z.object({
      id: z.string(),
      summary: z.string(),
    }),
  ),
  pageSize: z.number(),
  nextPageToken: z.string().optional(),
});

export type QueryLogsInput = z.infer<typeof inputSchema>;
type QueryLogsOutput = z.infer<typeof outputSchema>;

export const queryLogsTool = (dependencies: {
  api: CloudLoggingApi;
  cache: LogCache;
}): Tool<typeof inputSchema> => {
  return {
    name: "queryLogs",
    description: "Returns a list of log summaries based on the given query",
    inputSchema: inputSchema,
    handler: async ({input}: { input: QueryLogsInput }) => {
      const result = await queryLogs(dependencies)(input);
      
      return result.match(
        (data) => ({
          content: [{
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          }],
        }),
        (error) => ({
          content: [{
            type: "text" as const,
            text: `Error querying logs: ${error.message}`,
          }],
        })
      );
    },
  };
};

// TODO: This type is shared between the tools. Consider moving it to a common location.
type Tool<InputSchema extends z.ZodTypeAny> = {
  name: string;
  description: string;
  inputSchema: InputSchema;
  handler: ToolCallback<{ input: InputSchema }>;
}