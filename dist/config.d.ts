/**
 * Configuration for Joule Finance X/Twitter Poster
 *
 * This file contains the configuration settings for the Joule Finance
 * X/Twitter posting agent. It loads values from environment variables.
 */
import { Network } from '@aptos-labs/ts-sdk';
export interface Config {
    aptos: {
        network: Network;
        privateKey: string;
        nodeUrl?: string;
    };
    twitter: {
        apiKey?: string;
        apiSecret?: string;
        accessToken?: string;
        accessSecret?: string;
        username?: string;
        password?: string;
        email?: string;
        twoFactorSecret?: string;
        cookiesAuthToken?: string;
        cookiesCt0?: string;
        cookiesGuestId?: string;
        clientId?: string;
        clientSecret?: string;
    };
    joule: {
        contracts: {
            main: string;
            lending: string;
            staking: string;
        };
        supportedAssets: string[];
        riskParameters: {
            collateralFactors: Record<string, number>;
            liquidationThresholds: Record<string, number>;
        };
    };
    llm: {
        model: string;
        apiKey: string;
        temperature: number;
    };
    scheduler: {
        enabled: boolean;
        dailyPostingTime: string;
        weeklyReportDay: number;
        weeklyReportTime: string;
    };
    posting: {
        frequencySeconds: number;
        enableSocialInteractions: boolean;
    };
    APTOS_ENDPOINT: string;
    DEVELOPMENT_MODE: boolean;
    POST_FREQUENCY_SECONDS: number;
    OPENAI_MODEL?: string;
}
declare const config: Config;
export declare const validateConfig: () => void;
export default config;
