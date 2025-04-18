/**
 * Configuration for Joule Finance X/Twitter Poster
 *
 * This file contains the configuration settings for the Joule Finance
 * X/Twitter posting agent. It loads values from environment variables.
 */
import dotenv from 'dotenv';
import { Network } from '@aptos-labs/ts-sdk';
dotenv.config();
// Convert network string to Network enum
const getNetwork = (networkStr) => {
    switch (networkStr?.toLowerCase()) {
        case 'testnet':
            return Network.TESTNET;
        case 'devnet':
            return Network.DEVNET;
        case 'mainnet':
        default:
            return Network.MAINNET;
    }
};
// Create and export the configuration
const config = {
    aptos: {
        network: Network.MAINNET,
        privateKey: process.env.APTOS_PRIVATE_KEY || '0x1234',
        nodeUrl: process.env.APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1',
    },
    twitter: {
        apiKey: process.env.TWITTER_API_KEY || '',
        apiSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
        username: process.env.TWITTER_USERNAME,
        password: process.env.TWITTER_PASSWORD,
        email: process.env.TWITTER_EMAIL,
        twoFactorSecret: process.env.TWITTER_2FA_SECRET,
        cookiesAuthToken: process.env.TWITTER_COOKIES_AUTH_TOKEN,
        cookiesCt0: process.env.TWITTER_COOKIES_CT0,
        cookiesGuestId: process.env.TWITTER_COOKIES_GUEST_ID,
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET
    },
    joule: {
        contracts: {
            main: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6",
            lending: process.env.JOULE_LENDING_CONTRACT || '0xf3a39de749efe6b1fb5087c8da67e9ef6d4f48aea5b96eb502dbd4aabac35e64',
            staking: process.env.JOULE_STAKING_CONTRACT || '0x111169ad690e16881e6e85e86e13c79c22a25a25cabf0cef70140dd8328e6c99',
        },
        supportedAssets: [
            'APT',
            'USDC',
            'USDT',
            'jpufETH',
            'jrswETH',
            'jezETH',
            'stAPT'
        ],
        // Risk parameters based on documentation
        riskParameters: {
            collateralFactors: {
                APT: 0.80,
                USDC: 0.85,
                USDT: 0.85,
                jpufETH: 0.80,
                jrswETH: 0.80,
                jezETH: 0.80
            },
            liquidationThresholds: {
                APT: 0.85,
                USDC: 0.90,
                USDT: 0.90,
                jpufETH: 0.85,
                jrswETH: 0.85,
                jezETH: 0.85
            }
        }
    },
    llm: {
        model: 'claude-3-haiku-20240307',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    },
    scheduler: {
        enabled: process.env.SCHEDULER_ENABLED === 'true',
        dailyPostingTime: process.env.DAILY_POSTING_TIME || '10:00', // 24-hour format
        weeklyReportDay: parseInt(process.env.WEEKLY_REPORT_DAY || '1'), // Monday = 1, Sunday = 7
        weeklyReportTime: process.env.WEEKLY_REPORT_TIME || '12:00',
    },
    posting: {
        frequencySeconds: process.env.POST_FREQUENCY ?
            parseInt(process.env.POST_FREQUENCY) : 3600,
        enableSocialInteractions: process.env.NODE_ENV !== 'production'
    },
    APTOS_ENDPOINT: process.env.APTOS_ENDPOINT || 'https://fullnode.mainnet.aptoslabs.com/v1',
    DEVELOPMENT_MODE: !process.env.TWITTER_ACCESS_TOKEN_SECRET,
    POST_FREQUENCY_SECONDS: 300, // 5 minutes
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4'
};
// Validate critical configuration
export const validateConfig = () => {
    const missing = [];
    if (!config.aptos.privateKey)
        missing.push('APTOS_PRIVATE_KEY');
    if (!config.llm.apiKey)
        missing.push('ANTHROPIC_API_KEY');
    // Twitter config is needed for actual posting (not required for development mode)
    const missingTwitter = [];
    if (!config.twitter.apiKey)
        missingTwitter.push('TWITTER_API_KEY');
    if (!config.twitter.apiSecret)
        missingTwitter.push('TWITTER_API_SECRET');
    if (!config.twitter.accessToken)
        missingTwitter.push('TWITTER_ACCESS_TOKEN');
    if (!config.twitter.accessSecret)
        missingTwitter.push('TWITTER_ACCESS_TOKEN_SECRET');
    if (missingTwitter.length > 0) {
        console.warn(`WARNING: Missing Twitter API credentials: ${missingTwitter.join(', ')}`);
        console.warn('The agent will run in development mode (tweets will be logged but not posted)');
    }
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
try {
    validateConfig();
}
catch (error) {
    console.error('Configuration error:', error.message);
    // Don't throw here, let the application handle this
}
export default config;
