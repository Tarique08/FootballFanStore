import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { URL } from "node:url";
import { readJsonFile, writeJsonFile } from "./lib/store.js";
import type {
  CartItemInput,
  CartItemRecord,
  ContactMessage,
  CustomerDetails,
  NewsletterSignup,
  OrderRecord,
  Product
} from "./types.js";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
const publicRoot = process.cwd();
const allowedStaticFiles = new Set(["/index.html", "/style.css", "/script.js", "/data/products.json"]);

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp"
};

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendError(response: ServerResponse, statusCode: number, message: string) {
  sendJson(response, statusCode, { error: message });
}

async function parseJsonBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const totalSize = chunks.reduce((sum, part) => sum + part.length, 0);
    if (totalSize > 1_000_000) {
      throw new Error("Request body is too large.");
    }
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    throw new Error("Request body is required.");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

async function tryParseBody<T>(request: IncomingMessage, response: ServerResponse): Promise<T | null> {
  try {
    return await parseJsonBody<T>(request);
  } catch (error) {
    sendError(response, 400, error instanceof Error ? error.message : "Invalid request body.");
    return null;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getShippingAmount(subtotal: number): number {
  return subtotal >= 2499 ? 0 : 99;
}

async function getProducts(): Promise<Product[]> {
  return readJsonFile<Product[]>("products.json", []);
}

async function buildOrderItems(items: CartItemInput[], products: Product[]): Promise<CartItemRecord[]> {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Unknown product: ${item.productId}`);
    }

    if (!product.sizes.includes(item.size)) {
      throw new Error(`Invalid size for ${product.name}.`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      image: product.image
    };
  });
}

function validateCustomer(customer: Partial<CustomerDetails>): CustomerDetails {
  const fullName = normalizeText(customer.fullName);
  const email = normalizeText(customer.email);
  const phone = normalizeText(customer.phone);
  const city = normalizeText(customer.city);
  const address = normalizeText(customer.address);
  const pincode = normalizeText(customer.pincode);
  const notes = normalizeText(customer.notes);

  if (!fullName || !email || !phone || !city || !address || !pincode) {
    throw new Error("Please complete all required checkout fields.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Pincode must be 6 digits.");
  }

  return {
    fullName,
    email,
    phone,
    city,
    address,
    pincode,
    notes
  };
}

async function serveStaticFile(response: ServerResponse, requestPath: string, method: string | undefined) {
  const decodedPath = (() => {
    try {
      return decodeURIComponent(requestPath);
    } catch {
      return requestPath;
    }
  })();
  const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const isImage = normalizedPath.startsWith("/images/");

  if (!isImage && !allowedStaticFiles.has(normalizedPath)) {
    sendError(response, 404, "File not found.");
    return;
  }

  const relativePath = path.normalize(normalizedPath).replace(/^[/\\]+/, "");
  const filePath = path.resolve(publicRoot, relativePath);
  const imagesRoot = path.resolve(publicRoot, "images");

  if (isImage && !filePath.startsWith(imagesRoot)) {
    sendError(response, 403, "Access denied.");
    return;
  }

  if (!isImage && !filePath.startsWith(publicRoot)) {
    sendError(response, 403, "Access denied.");
    return;
  }

  try {
    await access(filePath);
  } catch {
    sendError(response, 404, "File not found.");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": contentTypes[extension] ?? "application/octet-stream"
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

async function handleApi(request: IncomingMessage, response: ServerResponse, url: URL) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok", timestamp: new Date().toISOString() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/products") {
    const products = await getProducts();
    const category = normalizeText(url.searchParams.get("category"));
    const query = normalizeText(url.searchParams.get("q")).toLowerCase();
    const featuredOnly = url.searchParams.get("featured") === "true";

    const filteredProducts = products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const matchesFeatured = !featuredOnly || product.featured;
      const haystack = [product.name, product.description, ...product.searchTerms].join(" ").toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesFeatured && matchesQuery;
    });

    sendJson(response, 200, filteredProducts);
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/products/")) {
    const identifier = decodeURIComponent(url.pathname.replace("/api/products/", ""));
    const products = await getProducts();
    const product = products.find((entry) => entry.id === identifier || entry.slug === identifier);

    if (!product) {
      sendError(response, 404, "Product not found.");
      return;
    }

    sendJson(response, 200, product);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/newsletter") {
    const payload = await tryParseBody<{ email?: string }>(request, response);
    if (!payload) return;
    const email = normalizeText(payload.email).toLowerCase();

    if (!isValidEmail(email)) {
      sendError(response, 400, "Please enter a valid email address.");
      return;
    }

    const existing = await readJsonFile<NewsletterSignup[]>("newsletter.json", []);
    if (existing.some((entry) => entry.email.toLowerCase() === email)) {
      sendJson(response, 200, { message: "You are already subscribed." });
      return;
    }

    const nextEntry: NewsletterSignup = {
      email,
      createdAt: new Date().toISOString()
    };

    existing.push(nextEntry);
    await writeJsonFile("newsletter.json", existing);

    sendJson(response, 201, { message: "Subscription saved.", entry: nextEntry });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/contact") {
    const payload = await tryParseBody<{ name?: string; email?: string; subject?: string; message?: string }>(request, response);
    if (!payload) return;
    const name = normalizeText(payload.name);
    const email = normalizeText(payload.email);
    const subject = normalizeText(payload.subject) || "General enquiry";
    const message = normalizeText(payload.message);

    if (!name || !email || !message) {
      sendError(response, 400, "Name, email, and message are required.");
      return;
    }

    if (!isValidEmail(email)) {
      sendError(response, 400, "Please enter a valid email address.");
      return;
    }

    const contacts = await readJsonFile<ContactMessage[]>("contacts.json", []);
    const entry: ContactMessage = {
      id: generateId("contact"),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString()
    };

    contacts.push(entry);
    await writeJsonFile("contacts.json", contacts);

    sendJson(response, 201, { message: "Message received.", entry });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/orders") {
    const payload = await tryParseBody<{ items?: CartItemInput[]; customer?: Partial<CustomerDetails> }>(request, response);
    if (!payload) return;
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!items.length) {
      sendError(response, 400, "Cart is empty.");
      return;
    }

    const products = await getProducts();
    let orderItems: CartItemRecord[];

    try {
      orderItems = await buildOrderItems(items, products);
    } catch (error) {
      sendError(response, 400, error instanceof Error ? error.message : "Invalid cart items.");
      return;
    }

    let customer: CustomerDetails;
    try {
      customer = validateCustomer(payload.customer ?? {});
    } catch (error) {
      sendError(response, 400, error instanceof Error ? error.message : "Invalid customer details.");
      return;
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = getShippingAmount(subtotal);
    const total = subtotal + shipping;

    const orders = await readJsonFile<OrderRecord[]>("orders.json", []);
    const order: OrderRecord = {
      id: `FFS-${Date.now().toString(36).toUpperCase()}`,
      items: orderItems,
      subtotal,
      shipping,
      total,
      customer,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    await writeJsonFile("orders.json", orders);

    sendJson(response, 201, {
      message: "Order placed successfully.",
      orderId: order.id,
      order
    });
    return;
  }

  sendError(response, 404, "API route not found.");
}

const server = createServer(async (request, response) => {
  try {
    if (!request.url) {
      sendError(response, 400, "Invalid request.");
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendError(response, 405, "Method not allowed.");
      return;
    }

    await serveStaticFile(response, url.pathname, request.method);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    sendError(response, 500, message);
  }
});

server.listen(port, host, () => {
  console.log(`FootballFanStore server running at http://localhost:${port}`);
});
