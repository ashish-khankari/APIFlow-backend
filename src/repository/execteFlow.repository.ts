import pool from "../config/database"
import { handleExecution } from "../utils/executionEngine";
import { RowDataPacket } from "mysql2";


type nodeMethods =
    "GET" |
    "POST" |
    "PUT" |
    "DELETE" |
    "PATCH"

export interface NodeExecutionInterface {
    id: number,
    node_id: number,
    flow_id: number,
    user_id: number,
    title: string,
    description: string,
    order: number,
    node_api_method: nodeMethods,
    node_api_base_url: string,
    node_api_end_point: string,
    node_api_token: string,
    node_api_headers: Record<string, unknown>,
    node_api_request_body: Record<string, unknown>,
    node_api_query: Record<string, unknown>,
    node_api_params: Record<string, unknown>
}
export const executeFlow = async (flowId: number, userId: number) => {
    const getApisFlow = `
    SELECT
        node.id,
        node.node_title,
        node.node_description,
        node.node_order,
        node.user_id,
        node.flow_id,
        node_api.id,
        node_api.node_api_method,
        node_api.node_api_base_url,
        node_api.node_api_end_point,
        node_api.node_api_token,
        node_api.node_api_headers,
        node_api.node_api_request_body,
        node_api.node_api_query,
        node_api.node_api_params,
        node_api.created_at
    from node 
    INNER JOIN node_api ON node.id = node_api.node_id
    WHERE node.user_id = ? AND node.flow_id = ?
    ORDER BY node.node_order ASC;`


    const getTokenKey = `SELECT token_key FROM flow WHERE id = ? AND user_id = ?`

    const [token] = await pool.execute(getTokenKey, [flowId, userId])
    const [rows] = await pool.execute<(NodeExecutionInterface & RowDataPacket)[]>(getApisFlow, [userId, flowId]);
    await handleExecution(rows, token as any)
    return rows;
}
