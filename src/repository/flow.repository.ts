import pool from "../config/database";
import { flowInterface } from "../controllers/flow.controller";

export const createFlow = async (data: flowInterface) => {
    const query = `INSERT INTO flow (user_id, flow_name, flow_description) VALUES (? ,?, ?);`;
    const [rows] = await pool.execute(query, [
        data.user_id,
        data.flow_name,
        data.flow_description
    ]);

    return rows;
}

export const getAllFlow = async (id: number) => {
    const query = `SELECT * FROM flow WHERE user_id = ?;`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

export const deleteFlow = async (user_id: number, id: string) => {
    const query = `DELETE FROM flow WHERE user_id = ? AND id = ?;`;
    const [rows] = await pool.execute(query, [user_id, id]);
    return rows;
}

export const fetchSingleFlow = async (user_id: number, id: string) => {
    const query = `SELECT * FROM flow WHERE user_id = ? AND id = ?;`;
    const [rows] = (await pool.execute(query, [user_id, id]) as any);
    return rows[0];
}

export const updateFlow = async (data: flowInterface, user_id: number, id: string) => {
    const query =
        `UPDATE 
            flow 
        SET 
            flow_name=COALESCE(?, flow_name),
            flow_description=COALESCE(?, flow_description)
        WHERE 
            user_id=? AND id=?`;
    const [rows] = await pool.execute(query, [data.flow_name, data.flow_description, user_id, id]);
    return rows;
}
