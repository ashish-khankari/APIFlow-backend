import pool from "../config/database";
import { NodeFlowInterface } from "../controllers/node.controller";

export const createNode = async (data: NodeFlowInterface) => {
    const query = `
    INSERT INTO node_flow (
        node_title,
        node_description,
        node_method,
        node_base_url,
        node_end_point,
        node_token,
        headers,
        request_body,
        flow_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute(query, [
        data.node_title,
        data.node_description,
        data.node_method,
        data.node_base_url,
        data.node_end_point ?? null,
        data.node_token ?? null,
        data.headers ? JSON.stringify(data.headers) : null,
        data.request_body ? JSON.stringify(data.request_body) : null,
        data.flow_id
    ]);
    return rows;
}

export const getNodeFlow = async (id: number, flowId: number) => {
    const query = `
    SELECT * FROM node_flow WHERE id = ? AND flow_id = ?;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}