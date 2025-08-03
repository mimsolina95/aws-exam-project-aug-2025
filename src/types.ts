export interface JsonObject {
    itemId: string;
    timestamp: number;
    content: JsonContent;
}

export interface JsonContent {
    "valid": boolean,
    "value": number,
    "description": string,
    "buyer": string;
}