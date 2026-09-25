import { RowDataPacket } from "mysql2";
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
        node_api_end_point,
        node_api_token,
        node_api_headers,
        node_api_request_body,
        node_api_query,
        node_api_params
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        node_api_method = VALUES(node_api_method),
        node_api_base_url = VALUES(node_api_base_url),
        node_api_end_point = VALUES(node_api_end_point),
        node_api_token = VALUES(node_api_token),
        node_api_headers = VALUES(node_api_headers),
        node_api_request_body = VALUES(node_api_request_body),
        node_api_query = VALUES(node_api_query),
        node_api_params = VALUES(node_api_params);`;

  const [rows] = await pool.execute(query, [
    data.node_id,
    data.flow_id,
    data.user_id,
    data.node_api_method || 'GET',
    data.node_api_base_url,
    data.node_api_end_point ?? null,
    data.node_api_token ?? null,
    data.node_api_headers ? JSON.stringify(data.node_api_headers) : null,
    data.node_api_request_body
      ? JSON.stringify(data.node_api_request_body)
      : null,
    data.node_api_query ? JSON.stringify(data.node_api_query) : null,
    data.node_api_params ? JSON.stringify(data.node_api_params) : null,
  ]);
  return rows;
};

export const getAllNodeApi = async (user_id: number, flowId: number) => {
  const query = `
    SELECT * FROM node_api WHERE user_id = ? AND flow_id = ? ORDER BY id ASC;`;
  const [rows] = await pool.execute(query, [user_id, flowId]);
  return rows;
};

export const getNodeApi = async (
  id: number,
  user_id: number,
  flowId: number,
) => {
  const query = `
    SELECT * FROM node_api WHERE (id = ? OR node_id = ?) AND user_id = ? AND flow_id = ?;`;
  const [rows] = await pool.execute<RowDataPacket[]>(query, [id, id, user_id, flowId]);
  return rows?.[0];
};

export const updateNodeApi = async (
  id: number,
  flowId: number,
  data: Partial<NodeFlowInterface>,
) => {
  const updateNodeQuery = `
    UPDATE node_api SET
        node_api_method = COALESCE(?, node_api_method),
        node_api_base_url = COALESCE(?, node_api_base_url),
        node_api_end_point = COALESCE(?, node_api_end_point),
        node_api_token = COALESCE(?, node_api_token),
        node_api_headers = COALESCE(?, node_api_headers),
        node_api_request_body = COALESCE(?, node_api_request_body),
        node_api_query = COALESCE(?, node_api_query),
        node_api_params = COALESCE(?, node_api_params)
    WHERE (id = ? OR node_id = ?) AND flow_id = ?;`;

  const [rows] = await pool.execute(updateNodeQuery, [
    data.node_api_method ?? null,
    data.node_api_base_url ?? null,
    data.node_api_end_point ?? null,
    data.node_api_token !== undefined ? data.node_api_token : null,
    data.node_api_headers ? JSON.stringify(data.node_api_headers) : null,
    data.node_api_request_body
      ? JSON.stringify(data.node_api_request_body)
      : null,
    data.node_api_query ? JSON.stringify(data.node_api_query) : null,
    data.node_api_params ? JSON.stringify(data.node_api_params) : null,
    id,
    id,
    flowId,
  ]);
  return rows;
};

export const deleteNodeApi = async (id: number, flowId: number) => {
  const query = `
    DELETE FROM node_api WHERE (id = ? OR node_id = ?) AND flow_id = ?;`;
  const [rows] = await pool.execute(query, [id, id, flowId]);
  return rows;
};
