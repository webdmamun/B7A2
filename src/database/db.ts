import { Pool } from "pg";
import config from "../config";

const pool = new Pool({
  connectionString: config.database_url,
  ssl: {
    rejectUnauthorized: false
  }
});

export const initDb = async () => {
  try {
    // Create function to update timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add trigger for users
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_modtime ON users;
      CREATE TRIGGER update_users_modtime
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    `);

    // Create issues table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add trigger for issues
    await pool.query(`
      DROP TRIGGER IF EXISTS update_issues_modtime ON issues;
      CREATE TRIGGER update_issues_modtime
      BEFORE UPDATE ON issues
      FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    `);

    console.log("Database tables checked/created successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

export default pool;
