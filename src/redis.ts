/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import Config, { ConfigProvider } from '@kapeta/sdk-config';
import {createClient, RedisClientType} from 'redis';

const RESOURCE_TYPE = 'kapeta/resource-type-redis';
const PORT_TYPE = 'redis';

export type RedisClient = RedisClientType;

export const createRedisClient = async (config: ConfigProvider, resourceName: string):Promise<RedisClient> => {
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

    const redisHostname = `${redisInfo.host}:${redisInfo.port}`;

    url += `${redisHostname}`;

    console.log(`Connecting to Redis: ${redisHostname}`);

    const client:RedisClient = createClient({ url });

    try {
        await client.connect();

        console.log(`Connected to Redis: ${redisHostname}`);
    } catch (e) {
        console.error(`Failed to connect to Redis: ${redisHostname}`, e);
        throw e;
    }

    return client;
};

export class RedisDB {
    private readonly resourceName: string;
    private _client: RedisClient|undefined;

    constructor(resourceName:string) {
        this.resourceName = resourceName;
        Config.onReady(async (provider:ConfigProvider) => {
            await this.init(provider);
        })
    }

    private async init(provider:ConfigProvider) {
        this._client = await createRedisClient(provider, this.resourceName);
    }

    public client():RedisClient {
        if (!this._client) {
            throw new Error('RedisDB not ready');
        }
        return this._client;
    }

}