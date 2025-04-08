import {appRouter} from "../routes/router";
import {generateOpenApiDocument} from "trpc-to-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Full Stack Webapp API",
  description: "An API to work with images",
  version: "1.0.0",
  baseUrl: "http://localhost:3000",
  tags: ["images"],
});
