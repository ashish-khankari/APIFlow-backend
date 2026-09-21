import pool from "../config/database"

export const executeFlow = async (flowId: number, userId: number) => {
    const getAllFlow = `
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

    const [rows] = await pool.execute(getAllFlow, [userId, flowId]);
    return rows;
}
