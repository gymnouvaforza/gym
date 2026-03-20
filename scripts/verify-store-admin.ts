/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// Simple env loader similar to other scripts in the project
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value;
      }
    }
  }
}

loadEnv();

// We use dynamic import because the project uses ESM for the lib files
async function verify() {
  console.log("Verifying Store Admin Snapshot...");
  try {
    // Note: This requires tsx to run since we are importing TS files from src
    const { getStoreAdminSnapshot } = await import("../src/lib/data/store-admin");
    
    const snapshot = await getStoreAdminSnapshot();
    if (snapshot.warning) {
      console.error("Verification failed with warning:", snapshot.warning);
      // Let's try to see if we can get more details from the snapshot if possible
      process.exit(1);
    }
    console.log("Verification successful!");
    console.log(`Source: ${snapshot.source}`);
    console.log(`Categories count: ${snapshot.categories.length}`);
    console.log(`Products count: ${snapshot.products.length}`);
  } catch (error) {
    console.error("Verification failed with error:", error);
    if (error && typeof error === 'object' && 'message' in error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

verify();
