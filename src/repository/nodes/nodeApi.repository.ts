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
        data.node_api_params ? JSON.stringify(data.node_api_params) : null,
    ]);
    return rows;
}


export const getNodeApi = async (nodeId: number, userId: number) => {
    const query = `
    SELECT * FROM node_api WHERE node_id = ? AND user_id = ?;`;
    const [rows] = await pool.execute(query, [nodeId, userId]);
    return rows;
}

export const deleteNodeApi = async (nodeId: number, userId: number) => {
    const query = `
    DELETE FROM node_api WHERE node_id = ? AND user_id = ?;`;
    const [rows] = await pool.execute(query, [nodeId, userId]);
    return rows;
}

export const updateNodeApi = async (nodeId: number, userId: number, data: Partial<NodeFlowInterface>) => {
    const query = `
    UPDATE node_api SET
        node_api_method       = COALESCE(?, node_api_method),
        node_api_base_url     = COALESCE(?, node_api_base_url),
        node_api_endpoint     = COALESCE(?, node_api_endpoint),
        node_api_token        = COALESCE(?, node_api_token),
        node_api_headers      = COALESCE(?, node_api_headers),
        node_api_request_body = COALESCE(?, node_api_request_body),
        node_api_query        = COALESCE(?, node_api_query),
        node_api_params       = COALESCE(?, node_api_params)
    WHERE node_id = ? AND user_id = ?;`;

    const [rows]: any = await pool.execute(query, [
        data.node_api_method        ?? null,
        data.node_api_base_url      ?? null,
        data.node_api_endpoint      ?? null,
        data.node_api_token         ?? null,
        data.node_api_headers       ? JSON.stringify(data.node_api_headers)       : null,
        data.node_api_request_body  ? JSON.stringify(data.node_api_request_body)  : null,
        data.node_api_query         ? JSON.stringify(data.node_api_query)         : null,
        data.node_api_params        ? JSON.stringify(data.node_api_params)        : null,
        nodeId,
        userId,
    ]);

    if (rows.affectedRows === 0) {
        const error: any = new Error("Node API config not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    const [updated]: any = await pool.execute(
        `SELECT * FROM node_api WHERE node_id = ? AND user_id = ?;`,
        [nodeId, userId]
    );
    return updated?.[0];
}
