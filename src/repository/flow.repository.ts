import pool from "../config/database";
import { flowInterface } from "../controllers/flow.controller";

export const createFlow = async (data: flowInterface) => {
    const query = `INSERT INTO flow (user_id, flow_name, flow_description, token_key) VALUES (? ,?, ?, ?);`;
    const [rows] = await pool.execute(query, [
        data.user_id,
        data.flow_name,
        data.flow_description || "",
        data.token_key
    ]);

    return rows;
}

export const getAllFlow = async (id: number) => {
    const query = `SELECT * FROM flow WHERE user_id = ?;`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

export const deleteFlow = async (user_id: number, id: string) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete node_api rows associated with this flow
        await connection.execute(`DELETE FROM node_api WHERE flow_id = ? AND user_id = ?;`, [id, user_id]);

        // 2. Delete node rows associated with this flow
        await connection.execute(`DELETE FROM node WHERE flow_id = ? AND user_id = ?;`, [id, user_id]);

        // 3. Delete execution_log rows associated with this flow
        await connection.execute(`DELETE FROM execution_log WHERE flow_id = ? AND user_id = ?;`, [id, user_id]);

        // 4. Finally delete the flow
        const [rows] = await connection.execute(`DELETE FROM flow WHERE user_id = ? AND id = ?;`, [user_id, id]);

        await connection.commit();
        return rows;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const fetchSingleFlow = async (user_id: number, id: string) => {
    const query = `SELECT * FROM flow WHERE user_id = ? AND id = ?;`;
    const [rows] = (await pool.execute(query, [user_id, id]) as any);
    return rows[0];
}

export const updateFlow = async (data: flowInterface, id: string) => {
    const query =
        `UPDATE 
            flow 
        SET 
            flow_name=COALESCE(?, flow_name),
            flow_description=COALESCE(?, flow_description)
        WHERE 
            id=?`;
    const [rows] = await pool.execute(query, [data.flow_name ?? null, data.flow_description ?? null, id]);
    return rows;
}
