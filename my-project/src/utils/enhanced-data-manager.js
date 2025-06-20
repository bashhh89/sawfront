// Enhanced Data Manager with AnythingLLM Integration
import { anythingLLM } from './anythingllm';

export class DataManager {
  constructor() {
    this.serviceData = this.loadFromStorage('services', []);
    this.clientData = this.loadFromStorage('clients', []);
    this.sowData = this.loadFromStorage('sows', []);
    this.workspaceMap = this.loadFromStorage('workspaces', new Map());
  }

  // Storage helpers
  loadFromStorage(key, defaultValue) {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return defaultValue;
    }
  }

  saveToStorage(key, data) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  // Client Management
  getClients() {
    return this.clientData;
  }

  async addClient(clientData) {
    const client = {
      id: Date.now(),
      ...clientData,
      createdAt: new Date(),
      lastUpdated: new Date(),
      workspaceSlug: null,
      aiInsights: null,
      documents: [],
      activities: [],
    };

    // Create dedicated workspace for client
    try {
      const workspaceResult = await anythingLLM.createWorkspace(
        `${client.name}-${client.company}`.toLowerCase().replace(/\s+/g, '-'),
        {
          openAiPrompt: `You are an AI assistant specialized in analyzing ${client.company} and helping with their business needs. Focus on ${client.industry} industry insights.`,
        }
      );
      
      if (workspaceResult.workspace) {
        client.workspaceSlug = workspaceResult.workspace.slug;
        this.workspaceMap.set(client.id, workspaceResult.workspace.slug);
        this.saveToStorage('workspaces', this.workspaceMap);
      }
    } catch (error) {
      console.error('Failed to create client workspace:', error);
    }

    this.clientData.push(client);
    this.saveToStorage('clients', this.clientData);
    
    return client;
  }

  async updateClient(clientId, updates) {
    const clientIndex = this.clientData.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    this.clientData[clientIndex] = {
      ...this.clientData[clientIndex],
      ...updates,
      lastUpdated: new Date(),
    };

    this.saveToStorage('clients', this.clientData);
    return this.clientData[clientIndex];
  }

  async deleteClient(clientId) {
    const client = this.clientData.find(c => c.id === clientId);
    if (client && client.workspaceSlug) {
      try {
        await anythingLLM.deleteWorkspace(client.workspaceSlug);
      } catch (error) {
        console.error('Failed to delete client workspace:', error);
      }
    }

    this.clientData = this.clientData.filter(c => c.id !== clientId);
    this.workspaceMap.delete(clientId);
    this.saveToStorage('clients', this.clientData);
    this.saveToStorage('workspaces', this.workspaceMap);
  }

  async analyzeClient(clientId) {
    const client = this.clientData.find(c => c.id === clientId);
    if (!client) return null;

    try {
      const analysis = await anythingLLM.analyzeClient(client, client.workspaceSlug);
      
      await this.updateClient(clientId, {
        aiInsights: analysis.textResponse || analysis.response,
        lastAnalyzed: new Date(),
      });

      return analysis;
    } catch (error) {
      console.error('Client analysis failed:', error);
      return null;
    }
  }

  async uploadClientDocument(clientId, file) {
    const client = this.clientData.find(c => c.id === clientId);
    if (!client) return null;

    try {
      const result = await anythingLLM.uploadDocument(
        file,
        client.workspaceSlug ? [client.workspaceSlug] : []
      );

      if (result.documents && result.documents.length > 0) {
        const document = result.documents[0];
        client.documents.push({
          id: document.id || Date.now(),
          name: document.title || file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
          location: document.location,
        });

        await this.updateClient(clientId, { documents: client.documents });
      }

      return result;
    } catch (error) {
      console.error('Document upload failed:', error);
      return null;
    }
  }

  // Service Management
  getServices() {
    return this.serviceData;
  }

  addService(serviceData) {
    const service = {
      id: Date.now(),
      ...serviceData,
      createdAt: new Date(),
    };

    this.serviceData.push(service);
    this.saveToStorage('services', this.serviceData);
    return service;
  }

  updateService(serviceId, updates) {
    const serviceIndex = this.serviceData.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) return null;

    this.serviceData[serviceIndex] = {
      ...this.serviceData[serviceIndex],
      ...updates,
    };

    this.saveToStorage('services', this.serviceData);
    return this.serviceData[serviceIndex];
  }

  deleteService(serviceId) {
    this.serviceData = this.serviceData.filter(s => s.id !== serviceId);
    this.saveToStorage('services', this.serviceData);
  }

  // SOW Management
  getSOWs() {
    return this.sowData;
  }

  async generateSOW(clientId, selectedServiceIds, projectBrief) {
    const client = this.clientData.find(c => c.id === clientId);
    const selectedServices = this.serviceData.filter(s => selectedServiceIds.includes(s.id));
    
    if (!client) return null;

    try {
      const sowResult = await anythingLLM.generateSOW(client, selectedServices, projectBrief);
      
      const sow = {
        id: Date.now(),
        clientId,
        client,
        selectedServices,
        projectBrief,
        content: sowResult.textResponse || sowResult.response,
        status: 'draft',
        createdAt: new Date(),
        lastUpdated: new Date(),
      };

      this.sowData.push(sow);
      this.saveToStorage('sows', this.sowData);
      
      return sow;
    } catch (error) {
      console.error('SOW generation failed:', error);
      return null;
    }
  }

  updateSOW(sowId, updates) {
    const sowIndex = this.sowData.findIndex(s => s.id === sowId);
    if (sowIndex === -1) return null;

    this.sowData[sowIndex] = {
      ...this.sowData[sowIndex],
      ...updates,
      lastUpdated: new Date(),
    };

    this.saveToStorage('sows', this.sowData);
    return this.sowData[sowIndex];
  }

  deleteSOW(sowId) {
    this.sowData = this.sowData.filter(s => s.id !== sowId);
    this.saveToStorage('sows', this.sowData);
  }

  // Knowledge Base
  getHierarchicalData() {
    if (this.serviceData.length === 0) {
      return {
        name: 'Services',
        children: [],
      };
    }

    // Group services by category
    const categories = {};
    this.serviceData.forEach(service => {
      const category = service.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(service);
    });

    // Convert to hierarchical structure
    const children = Object.keys(categories).map(categoryName => ({
      name: categoryName,
      children: categories[categoryName].map(service => ({
        name: service.name,
        value: service.price || 1000,
        description: service.description,
        ...service,
      })),
    }));

    return {
      name: 'Services',
      children,
    };
  }

  // Innovation suggestions
  async generateInnovations() {
    try {
      const result = await anythingLLM.generateInnovationSuggestions(this.serviceData);
      return result.textResponse || result.response;
    } catch (error) {
      console.error('Innovation generation failed:', error);
      return null;
    }
  }

  // AI LinkedIn/Website scraping
  async scrapeLinkedInProfile(linkedinUrl) {
    try {
      const result = await anythingLLM.scrapeLinkedInProfile(linkedinUrl);
      return this.parseAIResponse(result.textResponse || result.response);
    } catch (error) {
      console.error('LinkedIn scraping failed:', error);
      return null;
    }
  }

  async scrapeWebsite(websiteUrl) {
    try {
      const result = await anythingLLM.scrapeWebsite(websiteUrl);
      return this.parseAIResponse(result.textResponse || result.response);
    } catch (error) {
      console.error('Website scraping failed:', error);
      return null;
    }
  }

  parseAIResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to simple parsing
      return {
        name: this.extractValue(response, 'name'),
        headline: this.extractValue(response, 'title|position|headline'),
        company: this.extractValue(response, 'company'),
        location: this.extractValue(response, 'location'),
        industry: this.extractValue(response, 'industry'),
        experience: this.extractValue(response, 'experience'),
        skills: this.extractValue(response, 'skills'),
        education: this.extractValue(response, 'education'),
        overview: this.extractValue(response, 'overview|description'),
        rawResponse: response,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { rawResponse: response };
    }
  }

  extractValue(text, patterns) {
    const patternArray = patterns.split('|');
    for (const pattern of patternArray) {
      const regex = new RegExp(`${pattern}:?\\s*([^\\n]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return 'Not found';
  }

  // Chat functionality
  async sendChatMessage(message, workspaceSlug = null) {
    try {
      const result = await anythingLLM.sendChatMessage(
        workspaceSlug || anythingLLM.workspace,
        message
      );
      return result;
    } catch (error) {
      console.error('Chat message failed:', error);
      return null;
    }
  }

  // Get all data for exports
  getAllData() {
    return {
      services: this.serviceData,
      clients: this.clientData,
      sows: this.sowData,
    };
  }

  // Import data
  importData(data) {
    if (data.services) {
      this.serviceData = data.services;
      this.saveToStorage('services', this.serviceData);
    }
    if (data.clients) {
      this.clientData = data.clients;
      this.saveToStorage('clients', this.clientData);
    }
    if (data.sows) {
      this.sowData = data.sows;
      this.saveToStorage('sows', this.sowData);
    }
  }
}

// Singleton instance
export const dataManager = new DataManager();
