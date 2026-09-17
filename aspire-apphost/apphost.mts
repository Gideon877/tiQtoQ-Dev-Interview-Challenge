// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

// Add your resources here, for example:
// const redis = await builder.addContainer("cache", "redis:latest");
// const postgres = await builder.addPostgres("db");

// API — run the compiled entry point with a package script
const api = await builder
    .addJavaScriptApp('api', '../api', { runScriptName: 'dev' })
   .withPnpm({ install: false , installArgs: ['--config.confirmModulesPurge=false'] })
    .withHttpEndpoint({ env: 'PORT' });

// UI — Next.js
const ui = await builder
    .addJavaScriptApp('ui', '../ui', { runScriptName: 'dev' })
   .withPnpm({ install: false, installArgs: ['--config.confirmModulesPurge=false'] })
    .withHttpEndpoint({ env: 'PORT' })
    .withReference(api)
    .withEnvironment('NEXT_PUBLIC_API_URL', api.getEndpoint('http')); ;

await builder.build().run();