import axios from 'axios';

import { NodeExecutionInterface } from "../repository/execteFlow.repository"
export const handleExecution = async (arr: NodeExecutionInterface[], token: any) => {

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
        try {
            const handleAxiosApis = await axios({
                url: `${node.node_api_base_url}${node?.node_api_end_point}?${node?.node_api_query ? new URLSearchParams(node.node_api_query as any).toString() : ''}`,
                headers: {
                    ...node?.node_api_headers,
                    ...(getToken ? { Authorization: `Bearer ${getToken}` } : {}),
                },
                method: node?.node_api_method,
                params: node?.node_api_params,
                data: node?.node_api_request_body
            });
            const result = findKey(handleAxiosApis?.data, token?.[0]?.token_key);

            if (result !== null) {
                getToken = result;
            }
        } catch (error: any) {
            console.log("error", error?.response?.data);
        }
    }
}