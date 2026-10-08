import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const here = dirname(fileURLToPath(import.meta.url));
const source =
  process.env.OPENAPI_PATH ?? join(here, '..', '..', '..', '..', '..', '..', 'api', 'Starter.Api', 'openapi.json');
const output = join(here, '..', 'src', 'lib', 'api', 'schema.ts');

const ast = await openapiTS(pathToFileURL(resolve(source)));

writeFileSync(output, astToString(ast, { formatOptions: { removeComments: true } }));
