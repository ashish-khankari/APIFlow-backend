import pool from "../config/database";

export const findUser = async (email: string, company_name: string) => {
  const [rows] = await pool.execute(
    `SELECT * FROM users
     WHERE email = ? OR company_name = ?`,
    [email, company_name],
  );

  return rows as any[];
};

export const validateUser = async (id: number) => {
  const [rows] = await pool.execute(
    `SELECT * FROM users
    WHERE id = ?`,
    [id],
  );
  return rows;
};
