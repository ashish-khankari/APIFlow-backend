import pool from "../../config/database";
import { NodeFlowInterface } from "../../controllers/nodes/node.controller";

export const createNodeApi = async (data: NodeFlowInterface) => {
    const query = `
    INSERT INTO node_api (
        node_method,
        node_base_url,
        node_end_point,
        node_token,
        headers,
        request_body,
        flow_id,
        user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute(query, [
        data.node_method,
        data.node_base_url,
        data.node_end_point ?? null,
        data.node_token ?? null,
        data.headers ? JSON.stringify(data.headers) : null,
        data.request_body ? JSON.stringify(data.request_body) : null,
        data.flow_id,
        data.user_id,
    ]);
    return rows;
}

export const getAllNodeApi = async (id: number, flowId: number) => {
    const query = `
    SELECT * FROM node_api WHERE id = ? AND flow_id = ? ORDER BY id ASC;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}

export const getNodeApi = async (id: number, flowId: number) => {
    const query = `
    SELECT * FROM node_api WHERE id = ? AND flow_id = ?;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}

export const deleteNodeApi = async (id: number, flowId: number) => {
    const query = `
    DELETE FROM node_api WHERE id = ? AND flow_id = ?;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}
