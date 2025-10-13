import { readFileSync, writeFileSync } from 'fs';

const FILE_INPUT = './src/lib/vultr/openapi.json';
const FILE_OUTPUT = './src/lib/vultr/openapi-filtered.json';
const TAGS_TO_KEEP = ['s3', 'instances', 'region'];

function readSpec(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function extractSchemaRefs(obj, refs = new Set()) {
  if (!obj || typeof obj !== 'object') {
    return refs;
  }

  if (obj.$ref && typeof obj.$ref === 'string') {
    const match = obj.$ref.match(/#\/components\/schemas\/(.+)/);
    if (match) {
      refs.add(match[1]);
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        extractSchemaRefs(item, refs);
      });
    } else if (typeof value === 'object') {
      extractSchemaRefs(value, refs);
    }
  }

  return refs;
}

function resolveAllDependencies(schemaName, schemas, resolved = new Set()) {
  if (resolved.has(schemaName) || !schemas[schemaName]) {
    return resolved;
  }

  resolved.add(schemaName);
  const refs = extractSchemaRefs(schemas[schemaName]);

  refs.forEach((ref) => {
    if (!resolved.has(ref)) {
      resolveAllDependencies(ref, schemas, resolved);
    }
  });

  return resolved;
}

function filterOpenAPISpec(spec) {
  const usedSchemas = new Set();

  // Remove paths that don't have matching operations
  const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
  
  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    let hasMatchingOperation = false;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.includes(method.toLowerCase())) {
        continue;
      }

      if (typeof operation !== 'object' || !operation) {
        continue;
      }

      const operationTags = operation.tags || [];
      const hasTag = operationTags.some((tag) => {
        return TAGS_TO_KEEP.includes(tag);
      });

      if (hasTag) {
        hasMatchingOperation = true;
        extractSchemaRefs(operation, usedSchemas);
      } else {
        delete pathItem[method];
      }
    }

    if (!hasMatchingOperation) {
      delete spec.paths[pathKey];
    }
  }

  // Remove unused schemas
  if (spec.components && spec.components.schemas) {
    const allRequiredSchemas = new Set();

    usedSchemas.forEach((schemaName) => {
      resolveAllDependencies(schemaName, spec.components.schemas, allRequiredSchemas);
    });

    for (const [schemaName] of Object.entries(spec.components.schemas)) {
      if (!allRequiredSchemas.has(schemaName)) {
        delete spec.components.schemas[schemaName];
      }
    }
  }

  return spec;
}

const spec = readSpec(FILE_INPUT);
filterOpenAPISpec(spec);
writeFileSync(FILE_OUTPUT, JSON.stringify(spec, null, 2));