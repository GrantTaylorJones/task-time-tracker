import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY || "";
const databaseId = "task-tracker";
const containerId = "projects";

let cosmosClient: CosmosClient | null = null;

function getCosmosClient(): CosmosClient {
  if (!cosmosClient) {
    cosmosClient = new CosmosClient({ endpoint, key });
  }
  return cosmosClient;
}

function getUserId(req: HttpRequest): string | null {
  // Azure Static Web Apps injects this header for authenticated users
  const clientPrincipal = req.headers.get("x-ms-client-principal");
  if (!clientPrincipal) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(clientPrincipal, "base64").toString("utf-8")
    );
    return decoded.userId || null;
  } catch {
    return null;
  }
}

// GET /api/project — load the user's project data
async function getProject(
  req: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = getUserId(req);
  if (!userId) {
    return { status: 401, jsonBody: { error: "Not authenticated" } };
  }

  try {
    const client = getCosmosClient();
    const container = client.database(databaseId).container(containerId);

    const { resource } = await container.item(userId, userId).read();

    if (!resource) {
      return {
        status: 200,
        jsonBody: {
          title: "My Project",
          description: "Click to edit this description",
          tasks: [],
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        title: resource.title,
        description: resource.description,
        tasks: resource.tasks,
      },
    };
  } catch (error: unknown) {
    const cosmosError = error as { code?: number };
    if (cosmosError.code === 404) {
      return {
        status: 200,
        jsonBody: {
          title: "My Project",
          description: "Click to edit this description",
          tasks: [],
        },
      };
    }
    return { status: 500, jsonBody: { error: "Failed to load project" } };
  }
}

// POST /api/project — save the user's project data
async function saveProject(
  req: HttpRequest,
  _context: InvocationContext
): Promise<HttpResponseInit> {
  const userId = getUserId(req);
  if (!userId) {
    return { status: 401, jsonBody: { error: "Not authenticated" } };
  }

  try {
    const body = (await req.json()) as {
      title: string;
      description: string;
      tasks: unknown[];
    };
    const client = getCosmosClient();
    const container = client.database(databaseId).container(containerId);

    await container.items.upsert({
      id: userId,
      userId: userId,
      title: body.title,
      description: body.description,
      tasks: body.tasks,
      updatedAt: new Date().toISOString(),
    });

    return { status: 200, jsonBody: { ok: true } };
  } catch {
    return { status: 500, jsonBody: { error: "Failed to save project" } };
  }
}

app.http("getProject", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "project",
  handler: getProject,
});

app.http("saveProject", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "project",
  handler: saveProject,
});