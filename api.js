// --- AnythingLLM API Configuration ---
const ANYTHINGLLM_CONFIG = {
    baseUrl: 'https://socialgarden-anything-llm.vo0egb.easypanel.host',
    apiKey: 'F7C84WV-75N4QWH-P9ERFRV-CWJ146T',
    workspace: 'main'
};

/**
 * Calls the AnythingLLM chat API for a specific workspace.
 * @param {string} message - The message to send to the chat.
 * @param {string} workspaceSlug - The slug of the workspace to use.
 * @returns {Promise<string>} - The text response from the API.
 */
async function callAnythingLLMWorkspace(message, workspaceSlug) {
    const response = await fetch(`${ANYTHINGLLM_CONFIG.baseUrl}/api/v1/workspace/${workspaceSlug}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANYTHINGLLM_CONFIG.apiKey}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            mode: 'chat'
        })
    });

    if (!response.ok) {
        throw new Error(`Workspace API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.textResponse || data.message || 'No response received';
}

/**
 * Creates a new workspace in AnythingLLM for a client.
 * @param {string} clientName - The name of the client to create a workspace for.
 * @returns {Promise<string>} - The slug of the newly created workspace.
 */
async function createClientWorkspace(clientName) {
    const workspaceName = `Client: ${clientName}`;
    const workspaceSlug = `client-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    const response = await fetch(`${ANYTHINGLLM_CONFIG.baseUrl}/api/v1/workspace/new`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANYTHINGLLM_CONFIG.apiKey}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: workspaceName,
            similarityThreshold: 0.7,
            openAiTemp: 0.7,
            openAiHistory: 20,
            openAiPrompt: `You are an AI assistant specialized in analyzing client information for Social Garden. You have access to client documents and should provide insights about their business needs, potential service matches, and strategic recommendations based on the uploaded materials.`,
            queryRefusalResponse: "I can only provide insights based on the client information and documents available in this workspace.",
            chatMode: "chat",
            topN: 4
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create workspace: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.workspace.slug;
}

/**
 * Uploads a document to a specific workspace in AnythingLLM.
 * @param {File} file - The file to upload.
 * @param {string} workspaceSlug - The slug of the workspace to upload to.
 * @returns {Promise<object>} - The details of the uploaded document.
 */
async function uploadDocumentToWorkspace(file, workspaceSlug) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('addToWorkspaces', workspaceSlug);

    const response = await fetch(`${ANYTHINGLLM_CONFIG.baseUrl}/api/v1/document/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ANYTHINGLLM_CONFIG.apiKey}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        anythingLLMDoc: data.documents[0]
    };
}

/**
 * Calls the main AnythingLLM chat API.
 * @param {string} message - The message to send to the chat.
 * @returns {Promise<string>} - The text response from the API.
 */
async function callAnythingLLM(message) {
    return await callAnythingLLMWorkspace(message, ANYTHINGLLM_CONFIG.workspace);
}
