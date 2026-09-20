import pool from "../../config/database";
import { NodeFlowInterface } from "../../controllers/nodes/nodeApi.controller";

export const createNodeApi = async (data: NodeFlowInterface) => {
    const query = `
    INSERT INTO node_api (
        node_id,
        flow_id,
        user_id,
        node_api_method,
        node_api_base_url,
        node_api_endpoint,
        node_api_token,
        node_api_headers,
        node_api_request_body,
        node_api_query,
        node_api_params
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute(query, [
        data.node_id,
        data.flow_id,
        data.user_id,
        data.node_api_method,
        data.node_api_base_url,
        data.node_api_endpoint ?? null,
        data.node_api_token ?? null,
        data.node_api_headers ? JSON.stringify(data.node_api_headers) : null,
        data.node_api_request_body ? JSON.stringify(data.node_api_request_body) : null,
        data.node_api_query ? JSON.stringify(data.node_api_query) : null,
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
