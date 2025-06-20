// AnythingLLM API Integration
export class AnythingLLMService {
  constructor() {
    this.baseUrl = 'https://socialgarden-anything-llm.vo0egb.easypanel.host';
    this.apiKey = 'MVHC8FE-84G436V-PP88GTV-YRXG72D';
    this.workspace = 'main';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AnythingLLM API Error:', error);
      throw error;
    }
  }

  // Authentication
  async verifyAuth() {
    try {
      const result = await this.makeRequest('/auth');
      return result.authenticated;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }

  // Workspace Management
  async createWorkspace(name, config = {}) {
    return this.makeRequest('/workspace/new', {
      method: 'POST',
      body: JSON.stringify({
        name,
        similarityThreshold: 0.7,
        openAiTemp: 0.7,
        openAiHistory: 20,
        chatMode: 'chat',
        topN: 4,
        ...config,
      }),
    });
  }

  async getWorkspaces() {
    return this.makeRequest('/workspaces');
  }

  async getWorkspace(slug) {
    return this.makeRequest(`/workspace/${slug}`);
  }

  async deleteWorkspace(slug) {
    return this.makeRequest(`/workspace/${slug}`, {
      method: 'DELETE',
    });
  }

  // Chat functionality
  async sendChatMessage(workspaceSlug, message, reset = false) {
    return this.makeRequest(`/workspace/${workspaceSlug}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        reset,
        mode: 'chat',
      }),
    });
  }

  async streamChat(workspaceSlug, message, reset = false) {
    const url = `${this.baseUrl}/api/v1/workspace/${workspaceSlug}/stream-chat`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        reset,
        mode: 'chat',
      }),
    });

    return response; // Return response for streaming
  }

  // Document Management
  async uploadDocument(file, workspaces = []) {
    const formData = new FormData();
    formData.append('file', file);
    if (workspaces.length > 0) {
      formData.append('addToWorkspaces', workspaces.join(','));
    }

    return this.makeRequest('/document/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
  }

  async uploadLink(url, workspaces = []) {
    return this.makeRequest('/document/upload-link', {
      method: 'POST',
      body: JSON.stringify({
        link: url,
        addToWorkspaces: workspaces.join(','),
      }),
    });
  }

  async uploadRawText(textContent, metadata, workspaces = []) {
    return this.makeRequest('/document/raw-text', {
      method: 'POST',
      body: JSON.stringify({
        textContent,
        metadata,
        addToWorkspaces: workspaces.join(','),
      }),
    });
  }

  async getDocuments() {
    return this.makeRequest('/documents');
  }

  async updateWorkspaceEmbeddings(workspaceSlug, adds = [], deletes = []) {
    return this.makeRequest(`/workspace/${workspaceSlug}/update-embeddings`, {
      method: 'POST',
      body: JSON.stringify({
        adds,
        deletes,
      }),
    });
  }

  // AI Analysis helpers
  async analyzeClient(clientData, workspaceSlug = null) {
    const prompt = `
Analyze this client profile and provide insights:

Client Information:
- Name: ${clientData.name}
- Company: ${clientData.company}
- Industry: ${clientData.industry}
- Status: ${clientData.status}
- Deal Value: $${clientData.dealValue || 0}
- Notes: ${clientData.notes || 'None'}

Please provide:
1. 🎯 Business Profile Summary
2. 📊 Potential Service Matches
3. 💡 Strategic Recommendations
4. 🚀 Next Steps & Opportunities
5. ⚠️ Risk Assessment

Format the response in markdown with clear sections.
`;

    const targetWorkspace = workspaceSlug || this.workspace;
    return this.sendChatMessage(targetWorkspace, prompt);
  }

  async scrapeLinkedInProfile(linkedinUrl) {
    const prompt = `
Please scrape and analyze this LinkedIn profile: ${linkedinUrl}

Extract the following information:
1. Full name
2. Current job title and company
3. Location
4. Number of connections/followers
5. Work experience summary
6. Key skills and expertise
7. Education background
8. Professional achievements or notable activities

Please provide clear, detailed information for each section and format as JSON if possible.
`;

    return this.sendChatMessage(this.workspace, prompt);
  }

  async scrapeWebsite(websiteUrl) {
    const prompt = `
Please scrape and analyze this website: ${websiteUrl}

Extract comprehensive company information including:
1. Company name and overview
2. Industry and market focus
3. Products and services offered
4. Company size and founding information
5. Key value propositions
6. Target market and customers
7. Recent news or achievements
8. Contact information

Please provide detailed analysis and format as JSON if possible.
`;

    return this.sendChatMessage(this.workspace, prompt);
  }

  async generateSOW(clientData, selectedServices, projectBrief) {
    const prompt = `
Generate a comprehensive Statement of Work (SOW) based on:

Client: ${clientData.name} (${clientData.company})
Industry: ${clientData.industry}
Project Brief: ${projectBrief}

Selected Services:
${selectedServices.map(service => `- ${service.name}: ${service.description}`).join('\n')}

Please create a detailed SOW including:
1. Executive Summary
2. Project Scope and Objectives
3. Deliverables and Timeline
4. Resource Requirements
5. Budget Estimation
6. Terms and Conditions
7. Success Metrics

Format as a professional document ready for client presentation.
`;

    return this.sendChatMessage(this.workspace, prompt);
  }

  async generateInnovationSuggestions(serviceData = []) {
    const prompt = `
Based on current service offerings, generate innovative AI-powered enhancement suggestions:

Current Services:
${serviceData.map(service => `- ${service.name}: ${service.description}`).join('\n')}

Please suggest 3-5 innovative enhancements that could:
1. Improve service delivery efficiency
2. Add AI/automation capabilities
3. Create competitive advantages
4. Enhance client experience
5. Generate new revenue streams

For each suggestion, provide:
- Title and description
- Implementation complexity (Low/Medium/High)
- Expected impact (Low/Medium/High)
- Key benefits
- Technical requirements

Format as JSON array for easy parsing.
`;

    return this.sendChatMessage(this.workspace, prompt);
  }
}

// Singleton instance
export const anythingLLM = new AnythingLLMService();
