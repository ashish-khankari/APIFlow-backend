import axios from 'axios';

import { NodeExecutionInterface } from "../repository/execteFlow.repository";

interface StepResult {
    node_id: number;
    node_title: string;
    node_order: number;
    status: 'success' | 'failed';
    statusCode: number;
    responseBody: any;
    durationMs: number;
    error?: string;
}

interface ExecutionResult {
    success: boolean;
    completedSteps: StepResult[];
    failedAt?: string;
}
export const handleExecution = async (arr: NodeExecutionInterface[], token: any): Promise<ExecutionResult> => {

    const results: StepResult[] = []
    const findKey = (obj: any, target: string): any => {
        for (const [key, value] of Object.entries(obj)) {

            if (key === target) {
                return value;
            }

            if (typeof value === "object" && value !== null) {
                const result = findKey(value, target);
                if (result !== null) {
                    return result;
                }

            }
        }
        return null;
    }

    let getToken = ''
    for (const node of arr) {
        const start = Date.now();
        try {
            const handleAxiosApis = await axios({
                url: `${node.node_api_base_url}${node?.node_api_end_point}?${node?.node_api_query ? new URLSearchParams(node.node_api_query as any).toString() : ''}`,
                headers: {
                    ...node?.node_api_headers,
                    ...(getToken ? { Authorization: `${getToken}` } : {}),
                },
                method: node?.node_api_method,
                params: node?.node_api_params,
                data: node?.node_api_request_body,

            });
            const result = findKey(handleAxiosApis?.data, token?.[0]?.token_key);

            if (result !== null) {
                getToken = result;
            }
            results.push({
                node_id: node.id,
                node_title: node.node_title,
                node_order: node.node_order,
                status: 'success',
                statusCode: handleAxiosApis.status,
                responseBody: handleAxiosApis.data,
                durationMs: Date.now() - start,
            })
        } catch (error: any) {
            results.push({
                node_id: node.id,
                node_title: node.node_title,
                node_order: node.node_order,
                status: 'failed',
                statusCode: error?.response?.status ?? 0,
                responseBody: error?.response?.data ?? null,
                durationMs: Date.now() - start,
                error: error?.message || 'Request failed',
            });
            return { success: false, completedSteps: results, failedAt: node.node_title };
        }
    }
    return { success: true, completedSteps: results };
};