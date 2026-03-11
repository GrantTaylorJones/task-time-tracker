import { Context, HttpRequest } from "@azure/functions";
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
  const clientPrincipal = req.headers["x-ms-client-principal"];
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

// GET /api/project
export async function getProject(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const userId = getUserId(req);
  context.log(`[getProject] userId=${userId ?? "null"}`);

  if (!userId) {
    context.res = { status: 401, body: { error: "Not authenticated" } };
    return;
  }

  if (!endpoint || !key) {
    context.log.error(
      "[getProject] COSMOS_ENDPOINT or COSMOS_KEY is not configured"
    );
    context.res = {
      status: 500,
      body: {
        error:
          "Server configuration error: Cosmos DB credentials are not set. Check COSMOS_ENDPOINT and COSMOS_KEY app settings.",
      },
    };
    return;
  }

  try {
    const client = getCosmosClient();
    const container = client.database(databaseId).container(containerId);

    context.log(
      `[getProject] Reading from database=${databaseId}, container=${containerId}, itemId=${userId}`
    );
    const { resource } = await container.item(userId, userId).read();

    if (!resource) {
      context.log("[getProject] No document found, returning defaults");
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          title: "My Project",
          description: "Click to edit this description",
          tasks: [],
        },
      };
      return;
    }

    context.log(
      `[getProject] Loaded project: title="${resource.title}", tasks=${resource.tasks?.length ?? 0}`
    );
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        title: resource.title,
        description: resource.description,
        tasks: resource.tasks,
      },
    };
  } catch (error: unknown) {
    const cosmosError = error as { code?: number; message?: string };
    context.log.error(
      `[getProject] Cosmos error: code=${cosmosError.code}, message=${cosmosError.message}`
    );

    if (cosmosError.code === 404) {
      context.log("[getProject] 404 from Cosmos, returning defaults");
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          title: "My Project",
          description: "Click to edit this description",
          tasks: [],
        },
      };
      return;
    }
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: `Failed to load project: ${cosmosError.message || "Unknown Cosmos DB error"}`,
      },
    };
  }
}

// POST /api/project
export async function saveProject(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const userId = getUserId(req);
  context.log(`[saveProject] userId=${userId ?? "null"}`);

  if (!userId) {
    context.res = { status: 401, body: { error: "Not authenticated" } };
    return;
  }

  if (!endpoint || !key) {
    context.log.error(
      "[saveProject] COSMOS_ENDPOINT or COSMOS_KEY is not configured"
    );
    context.res = {
      status: 500,
      body: {
        error:
          "Server configuration error: Cosmos DB credentials are not set. Check COSMOS_ENDPOINT and COSMOS_KEY app settings.",
      },
    };
    return;
  }

  try {
    const body = req.body as {
      title: string;
      description: string;
      tasks: unknown[];
    };

    context.log(
      `[saveProject] Saving to database=${databaseId}, container=${containerId}, title="${body.title}", tasks=${body.tasks?.length ?? 0}`
    );

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

    context.log("[saveProject] Upsert successful");
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true },
    };
  } catch (error: unknown) {
    const cosmosError = error as { code?: number; message?: string };
    context.log.error(
      `[saveProject] Cosmos error: code=${cosmosError.code}, message=${cosmosError.message}`
    );
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: `Failed to save project: ${cosmosError.message || "Unknown Cosmos DB error"}`,
      },
    };
  }
}