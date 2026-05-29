import app from "./app";
import config from "./config";

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`The server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main();
