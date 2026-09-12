import pool from "../config/database";
import { flowInterface } from "../controllers/flow.controller";

export const createFlow = async (data: flowInterface) => {
    const query = `INSERT INTO flow (user_id, flow_name, flow_description) VALUES (? ,?, ?)`;
    const [rows] = await pool.execute(query, [
        data.user_id,
        data.flow_name,
        data.flow_description
    ]);

    return rows;
}