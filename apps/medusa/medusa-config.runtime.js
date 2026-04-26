const fs = require("node:fs")
const path = require("node:path")
const { loadEnv, defineConfig } = require("@medusajs/framework/utils")

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isProduction = process.env.NODE_ENV === "production"

// --- Environment Validation ---
if (isProduction) {
  const missingOrInsecure = []
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "supersecret") {
    missingOrInsecure.push("JWT_SECRET")
  }
  if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET === "supersecret") {
    missingOrInsecure.push("COOKIE_SECRET")
  }
  if (!process.env.DATABASE_URL) {
    missingOrInsecure.push("DATABASE_URL")
  }
  if (!process.env.PAYPAL_CLIENT_ID) {
    missingOrInsecure.push("PAYPAL_CLIENT_ID")
  }
  if (!process.env.PAYPAL_CLIENT_SECRET) {
    missingOrInsecure.push("PAYPAL_CLIENT_SECRET")
  }

  if (missingOrInsecure.length > 0) {
    const errorMsg = `[SECURITY ERROR] Production environment validation failed. Missing or insecure secrets: ${missingOrInsecure.join(", ")}.
Make sure to set strong, unique values for these in production. FALLBACK TO "supersecret" IS NOT ALLOWED.`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  if (process.env.MEDUSA_DB_INSECURE_SSL === "true" && process.env.ALLOW_INSECURE_DB_SSL_IN_PRODUCTION !== "true") {
    const errorMsg = `[SECURITY ERROR] MEDUSA_DB_INSECURE_SSL=true is not allowed in production unless ALLOW_INSECURE_DB_SSL_IN_PRODUCTION=true is explicitly set.`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
}
// ------------------------------

const enableInsecureDbSsl = process.env.MEDUSA_DB_INSECURE_SSL === "true"
const hasPayPalCredentials =
  Boolean(process.env.PAYPAL_CLIENT_ID) && Boolean(process.env.PAYPAL_CLIENT_SECRET)
const hasS3Credentials =
  Boolean(process.env.S3_ACCESS_KEY_ID) && Boolean(process.env.S3_SECRET_ACCESS_KEY)

function resolveInternalModulePath(moduleName) {
  const compiledPath = path.join(process.cwd(), ".medusa", "server", "src", "modules", moduleName)

  if (fs.existsSync(compiledPath)) {
    return compiledPath
  }

  return `./src/modules/${moduleName}`
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: enableInsecureDbSsl
      ? {
          connection: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        }
      : {},
    http: {
      storeCors: process.env.STORE_CORS || (isProduction ? "" : "http://localhost:3000,http://localhost:3001"),
      adminCors:
        process.env.ADMIN_CORS || (isProduction ? "" : "http://localhost:7001,http://localhost:9000,http://localhost:3001"),
      authCors:
        process.env.AUTH_CORS || (isProduction ? "" : "http://localhost:7001,http://localhost:9000,http://localhost:3001"),
      jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : "supersecret"),
      cookieSecret: process.env.COOKIE_SECRET || (isProduction ? undefined : "supersecret"),
    },
  },
  modules: {
    payment: {
      resolve: "@medusajs/payment",
      options: {
        providers: hasPayPalCredentials
          ? [
              {
                resolve: resolveInternalModulePath("paypal"),
                id: "paypal",
                options: {
                  client_id: process.env.PAYPAL_CLIENT_ID,
                  client_secret: process.env.PAYPAL_CLIENT_SECRET,
                  environment: process.env.PAYPAL_ENVIRONMENT,
                  webhook_id: process.env.PAYPAL_WEBHOOK_ID,
                  region_id: process.env.MEDUSA_REGION_ID,
                },
              },
            ]
          : [],
      },
    },
    file: {
      resolve: "@medusajs/file",
      options: {
        providers: hasS3Credentials
          ? [
              {
                resolve: "@medusajs/file-s3",
                id: "s3",
                options: {
                  region: process.env.S3_REGION || "us-central-1",
                  bucket: process.env.S3_BUCKET || "medusa-media",
                  endpoint: process.env.S3_URL,
                  access_key_id: process.env.S3_ACCESS_KEY_ID,
                  secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  forcePathStyle: true,
                  s3ForcePathStyle: true,
                },
              },
            ]
          : [
              {
                resolve: "@medusajs/file-local",
                id: "local",
                options: {},
              },
            ],
      },
    },
    product: {
      resolve: "@medusajs/product",
      options: {},
    },
    pickupRequest: {
      resolve: resolveInternalModulePath("pickupRequest"),
    },
  },
})
