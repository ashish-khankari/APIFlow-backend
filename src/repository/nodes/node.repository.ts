import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../../config/database";
import { CreateNodeSlicesInterface, NodeIdsInterface } from "../../controllers/nodes/node.controller";

export const createNodesSlice = async (data: CreateNodeSlicesInterface) => {
    // 1. Verify flow exists and belongs to the authenticated user
    const checkFlowQuery = `SELECT id FROM flow WHERE id = ? AND user_id = ?;`;
    const [flowRows]: any = await pool.execute(checkFlowQuery, [data.flow_id, data.user_id]);
    if (!flowRows || flowRows.length === 0) {
        const error: any = new Error("Flow not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    // 2. Determine next contiguous node_order
    const getMax = `SELECT COALESCE(MAX(node_order), 0) AS max_order FROM node WHERE user_id = ? AND flow_id = ?;`;
    const [getMaxResult]: any = await pool.execute(getMax, [data.user_id, data.flow_id]);
    const maxOrder = getMaxResult?.[0]?.max_order ?? 0;
    const node_order = Number(maxOrder) + 1;

    // 3. Insert the node
    const query = `
    INSERT INTO node (
        node_title,
        node_description,
        flow_id,
        user_id,
        node_order
    ) VALUES (?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute<ResultSetHeader>(query, [
        data.node_title,
        data.node_description ?? null,
        data.flow_id,
        data.user_id,
        node_order,
    ]);

    return {
        id: rows.insertId,
        node_title: data.node_title,
        node_description: data.node_description ?? null,
        flow_id: data.flow_id,
        user_id: data.user_id,
        node_order,
    };
}

export const getAllNodeSlice = async (userId: number, flowId: number) => {
    const query = `
    SELECT * FROM node WHERE user_id = ? AND flow_id = ? ORDER BY node_order ASC;`;
    const [rows] = await pool.execute(query, [userId, flowId]);
    return rows;
}

export const getNode = async (ids: NodeIdsInterface) => {
    const query = `
    SELECT * FROM node WHERE user_id = ? AND flow_id = ? AND id = ?;`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [ids?.userId ?? null, ids?.flowId ?? null, ids?.id ?? null]);
    return rows?.[0];
}

export const deleteNodeById = async (id: number, flowId: number, userId: number) => {
    // 1. Fetch node to ensure existence, verify ownership, and capture its node_order
    const getQuery = `SELECT id, node_order FROM node WHERE id = ? AND flow_id = ? AND user_id = ?;`;
    const [existingNode]: any = await pool.execute(getQuery, [id, flowId, userId]);

    if (!existingNode || existingNode.length === 0) {
        const error: any = new Error("Node not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    const deletedOrder = existingNode[0].node_order;

    // 2. Delete the node
    const deleteQuery = `DELETE FROM node WHERE id = ? AND flow_id = ? AND user_id = ?;`;
    const [rows] = await pool.execute<ResultSetHeader>(deleteQuery, [id, flowId, userId]);

    // 3. Shift down subsequent nodes to maintain contiguous node_order
    const reorderQuery = `
    UPDATE node 
    SET node_order = node_order - 1 
    WHERE flow_id = ? AND user_id = ? AND node_order > ?;`;
    await pool.execute(reorderQuery, [flowId, userId, deletedOrder]);

    return rows;
}

export const updateNodeById = async (
    id: number,
    flowId: number,
    userId: number,
    data: Partial<CreateNodeSlicesInterface>
) => {
    const query = `
        UPDATE node SET 
            node_title = COALESCE(?, node_title),
            node_description = COALESCE(?, node_description)
        WHERE id = ? AND flow_id = ? AND user_id = ?;`;

    const [rows] = await pool.execute<ResultSetHeader>(query, [
        data.node_title ?? null,
        data.node_description ?? null,
        id,
        flowId,
        userId
    ]);

    if (rows.affectedRows === 0) {
        const error: any = new Error("Node not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    const [updatedRows]: any = await pool.execute(
        `SELECT * FROM node WHERE id = ? AND flow_id = ? AND user_id = ?;`,
        [id, flowId, userId]
    );

    return updatedRows?.[0];
}