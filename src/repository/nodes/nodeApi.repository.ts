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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  const [rows] = await pool.execute(query, [
    data.node_id,
    data.flow_id,
    data.user_id,
    data.node_api_method,
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
    SELECT * FROM node_api WHERE id = ? AND user_id = ? AND flow_id = ?;`;
  const [rows] = await pool.execute<RowDataPacket[]>(query, [id, user_id, flowId]);
  return rows?.[0];
};

export const updateNodeApi = async (
  id: number,
  flowId: number,
  data: NodeFlowInterface,
) => {
  const updateNodeQuery = `
    UPDATE node_api SET
        node_api_method = COALESCE(?, node_api_method),
        node_api_base_url = COALESCE(?, node_api_base_url),
        node_api_end_point = COALESCE(?, node_api_end_point),
        node_api_token = COALESCE(JSON_MERGE_PATCH(node_api_token, ?), node_api_token),
        node_api_headers = COALESCE(
          JSON_MERGE_PATCH(node_api_headers, ?),
          node_api_headers),
        node_api_request_body = COALESCE(
          JSON_MERGE_PATCH(node_api_request_body, ?),
          node_api_request_body
        ),
        node_api_query = COALESCE(
          JSON_MERGE_PATCH(node_api_query, ?),
          node_api_query
        ),
        node_api_params = COALESCE(
          JSON_MERGE_PATCH(node_api_params, ?),
          node_api_params
        )
    WHERE id = ? AND flow_id = ?;`;

  const [rows] = await pool.execute(updateNodeQuery, [
    data.node_api_method ?? null,
    data.node_api_base_url ?? null,
    data.node_api_end_point ?? null,
    data.node_api_token ?? null,

    data.node_api_headers ? JSON.stringify(data.node_api_headers) : null,

    data.node_api_request_body
      ? JSON.stringify(data.node_api_request_body)
      : null,

    data.node_api_query ? JSON.stringify(data.node_api_query) : null,

    data.node_api_params ? JSON.stringify(data.node_api_params) : null,

    id,
    flowId,
  ]);
  return rows;
};

export const deleteNodeApi = async (id: number, flowId: number) => {
  const query = `
    DELETE FROM node_api WHERE id = ? AND flow_id = ?;`;
  const [rows] = await pool.execute(query, [id, flowId]);
  return rows;
};
