import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum ditentukan");
}

const sql = neon(process.env.DATABASE_URL);

export const db = {
  query(queryString: string, params: any[] = []) {
    return sql.query(queryString, params);
  },
};