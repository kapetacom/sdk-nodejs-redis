/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import { ConfigProvider } from '@kapeta/sdk-config';
import { createClient } from 'redis';

export const RESOURCE_TYPE = 'kapeta/resource-type-redis';
export const PORT_TYPE = 'redis';

export const createRedisClient = async (config: ConfigProvider, resourceName: string) => {
    const redisInfo = await config.getResourceInfo(RESOURCE_TYPE, PORT_TYPE, resourceName);
    if (!redisInfo) {
        throw new Error(`Resource ${resourceName} not found`);
    }

    let url = 'redis://';
    if (redisInfo.credentials?.username) {
        url += encodeURIComponent(redisInfo.credentials.username);

        if (redisInfo.credentials.password) {
            url += ':' + encodeURIComponent(redisInfo.credentials.password);
        }
        url += '@';
    }

    url += `${redisInfo.host}:${redisInfo.port}`;

    const client = createClient({ url });

    await client.connect();

    return client;
};
