import pool from "../../config/database";
import { CreateNodeSlicesInterface } from "../../controllers/node.controller";

export const createNodesSlice = async (data: CreateNodeSlicesInterface) => {
    const getMax = `SELECT max(node_order) from node_slice WHERE user_id = ? AND flow_id = ?;`

    const [getMaxResult]: any = await pool.execute(getMax, [data.user_id, data.flow_id]);

    let currentNode = getMaxResult?.[0]?.['max(node_order)'];

    let node_order: number;
    if (currentNode === undefined || currentNode === null || currentNode === 0) {
        node_order = 1;
    } else {
        node_order = currentNode + 1;
    }

    const query = `
    INSERT INTO node_slice (
        node_title,
        node_description,
        flow_id,
        user_id,
        node_order
    ) VALUES (?, ?, ?, ?, ?);`;

    const [rows] = await pool.execute(query, [
        data.node_title,
        data.node_description,
        data.flow_id,
        data.user_id,
        node_order ?? null,
    ]);
    return rows;
}

export const getAllNodeSlice = async (id: number, flowId: number) => {
    const query = `
    SELECT * FROM node_slice WHERE user_id = ? AND flow_id = ? ORDER BY node_order ASC;`;
    const [rows] = await pool.execute(query, [id, flowId]);
    return rows;
}
