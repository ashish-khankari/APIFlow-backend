import pool from "../config/database"
import { handleExecution } from "../utils/executionEngine";
import { RowDataPacket } from "mysql2";
import crypto from 'crypto';

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
    node_title: string,
    node_description: string,
    node_order: number,
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

    const result = await handleExecution(rows, token as any);

    const overallStatus = result.success ? 'completed' : 'failed'

    const run_id = crypto.randomUUID();

    const createRun = `
    INSERT INTO execution_log
    (run_id, flow_id, user_id, status, completed_at)
    VALUES (?, ?, ?, ?, NOW());`;
    await pool.execute(createRun, [run_id, flowId, userId, overallStatus]);

    if (result.completedSteps.length > 0) {
        const insertStep = `
        INSERT INTO execution_step_log
        (run_id, node_id, node_title, node_order, status, status_code, response_body, duration_ms, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        for (const step of result.completedSteps) {
            await pool.execute(insertStep, [
                run_id,
                step.node_id,
                step.node_title,
                step.node_order,
                step.status,
                step.statusCode,
                step.responseBody ? JSON.stringify(step.responseBody) : null,
                step.durationMs,
                step.error ?? null,
            ]);
        }
    }

    return { run_id, ...result };
}

// GET /execute/:flowId/history — all past runs for a flow
export const getExecutionHistory = async (flowId: number, userId: number) => {
    const query = `
    SELECT 
        run_id,
        status,
        started_at,
        completed_at
    FROM execution_log
    WHERE flow_id = ? AND user_id = ?
    ORDER BY started_at DESC;`;

    const [rows] = await pool.execute(query, [flowId, userId]);
    return rows;
}

// GET /execute/run/:runId — step-by-step detail of one specific run
export const getExecutionRunDetail = async (runId: string, userId: number) => {
    // Verify the run belongs to this user
    const checkQuery = `SELECT run_id, flow_id, status, started_at, completed_at FROM execution_log WHERE run_id = ? AND user_id = ?;`;
    const [logRows]: any = await pool.execute(checkQuery, [runId, userId]);

    if (!logRows || logRows.length === 0) {
        const error: any = new Error("Run not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    const stepsQuery = `
    SELECT
        node_id,
        node_title,
        node_order,
        status,
        status_code,
        response_body,
        duration_ms,
        error_message,
        executed_at
    FROM execution_step_log
    WHERE run_id = ?
    ORDER BY node_order ASC;`;

    const [steps] = await pool.execute(stepsQuery, [runId]);

    return {
        ...logRows[0],
        steps,
    };
}
