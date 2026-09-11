import pool from "../config/database";
import { User } from "../types/user.types";

export const createUser = async (data: User, hashedPassword: string) => {
  const query = `INSERT INTO users (company_name, email, password, full_name) VALUES (?, ?, ?, ?);`;
  const [createUser] = await pool.execute(query, [
    data.company_name,
    data.email,
    hashedPassword,
    data.full_name,
  ]);
  return createUser;
};

export const getUserByEmail = async (email: string) => {
  const query = `SELECT * FROM users WHERE email = ?`;

  const [rows] = await pool.execute(query, [email]);

  return (rows as any[])[0];
};

export const getUserByID = async (id: any) => {
  const query = `SELECT 
                  id,
                  company_name,
                  email,
                  full_name,
                  created_at
                FROM
                  users
                WHERE 
                  id = ?;`;
  const [user] = (await pool.execute(query, [id])) as any;
  return user[0] || null;
};

export const getAllUsers = async () => {
  const query = `SELECT 
                  id, 
                  company_name,
                  email,
                  full_name,
                  created_at
                FROM
                  users;`;

  const [users] = await pool.execute(query);
  return users;
};

export const updateUser = async (id: number, data: User) => {
  const query = `UPDATE users SET company_name = ?, email= ?, password = ?, full_name = ? WHERE id = ?;`;
  const [updatedUsers] = await pool.execute(query, [
    id,
    data.company_name,
    data.email,
    data.password,
    data.full_name,
  ]);
  return updatedUsers;
};

export const deleteUser = async (id: number) => {
  const query = `DELETE FROM users WHERE id = ?;`;
  const [deletedUser] = await pool.execute(query, [id]);
  return deletedUser;
};
