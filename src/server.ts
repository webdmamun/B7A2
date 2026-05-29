import app from "./app";
import config from "./config";
import { initDb } from "./database/db";

async function main() {
  try {
    await initDb();
    
    app.listen(config.port, () => {
      console.log(`The server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main();
