import app from "./src/app.js";
import { getDb } from "./src/db/db.js";

const port = Number(process.env.PORT) || 3001;

getDb()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
    server.on("error", (err) => {
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
