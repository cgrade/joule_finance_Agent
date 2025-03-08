export declare class AptosClient {
    private readonly endpoint;
    constructor(endpoint?: string);
    /**
     * Call a view function on the blockchain
     */
    callViewFunction(address: string, module: string, func: string, typeArgs?: string[], args?: any[]): Promise<any>;
    /**
     * Get resources for an account
     */
    getResources(address: string): Promise<any[]>;
}
export default AptosClient;
