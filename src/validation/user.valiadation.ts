import pool from "../config/database";

export const findUser = async (email: string, username: string) => {
  const [rows] = await pool.execute(
    `SELECT * FROM users
     WHERE email = ? OR username = ?`,
    [email, username],
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
