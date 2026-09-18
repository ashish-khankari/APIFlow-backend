import pool from "../../config/database";
import { CreateNodeSlicesInterface } from "../../controllers/node.controller";

export const createNodesSlice = async (data: CreateNodeSlicesInterface) => {
    const query = `
    INSERT INTO node_slice (
        node_title,
        node_description,
        flow_id,
        node_order,
        user_id
    ) VALUES (?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute(query, [
        data.node_title,
        data.node_description,
        data.flow_id,
        data.node_order,
        data.user_id,
    ]);
    return rows;
}

export const getAllNodeSlice = async (id: number, flowId: number) => {
    const query = `
    SELECT * FROM node_slice WHERE user_id = ? AND flow_id = ? ORDER BY node_order ASC;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}
