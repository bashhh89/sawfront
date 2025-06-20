
// --- UNIFIED DATA STRUCTURES ---

// Unified Client Data Structure (CRM + SOW compatible)
class UnifiedClient {
    constructor(data = {}) {
        // Basic Info
        this.id = data.id || Date.now().toString();
        this.name = data.name || '';
        this.company = data.company || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.websiteUrl = data.websiteUrl || '';
        this.linkedinUrl = data.linkedinUrl || '';
        this.location = data.location || '';
        
        // Business Context
        this.industry = data.industry || '';
        this.companySize = data.companySize || '';
        this.annualRevenue = data.annualRevenue || '';
        this.businessModel = data.businessModel || '';
        
        // CRM Fields
        this.status = data.status || 'cold'; // cold, warm, hot, client
        this.priority = data.priority || 'medium'; // low, medium, high
        this.dealValue = data.dealValue || 0;
        this.source = data.source || '';
        this.assignedTo = data.assignedTo || '';
        
        // SOW-Specific Fields
        this.projectType = data.projectType || '';
        this.serviceNeeds = data.serviceNeeds || [];
        this.budget = data.budget || '';
        this.timeline = data.timeline || '';
        this.decisionMakers = data.decisionMakers || [];
        this.currentChallenges = data.currentChallenges || '';
        this.successMetrics = data.successMetrics || '';
        
        // AI Research Data
        this.researchData = data.researchData || {
            companyProfile: null,
            industryContext: null,
            technologyLandscape: null,
            competitiveAnalysis: null,
            complianceRequirements: null,
            lastResearchDate: null
        };
        
        // Documents & Attachments
        this.documents = data.documents || [];
        this.notes = data.notes || '';
        this.tags = data.tags || [];
        
        // SOW History
        this.sowHistory = data.sowHistory || [];
        this.activeSOW = data.activeSOW || null;
        
        // AI Workspace Integration
        this.workspaceSlug = data.workspaceSlug || null;
        this.workspaceId = data.workspaceId || null;
        
        // Timestamps
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastContactDate = data.lastContactDate || null;
        this.nextFollowUpDate = data.nextFollowUpDate || null;
    }
    
    // Helper Methods
    updateTimestamp() {
        this.updatedAt = new Date().toISOString();
    }
    
    addSOW(sowData) {
        const sow = new UnifiedSOW(sowData);
        sow.clientId = this.id;
        this.sowHistory.push(sow);
        this.activeSOW = sow.id;
        this.updateTimestamp();
        return sow;
    }
    
    addNote(note) {
        this.notes += `\n[${new Date().toLocaleDateString()}] ${note}`;
        this.updateTimestamp();
    }
    
    addDocument(doc) {
        this.documents.push({
            id: Date.now().toString(),
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadDate: new Date().toISOString(),
            data: doc.data || null
        });
        this.updateTimestamp();
    }
}

// Unified SOW Data Structure
class UnifiedSOW {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.clientId = data.clientId || null;
        this.title = data.title || '';
        this.version = data.version || '1.0';
        this.status = data.status || 'draft'; // draft, review, approved, sent, signed
        
        // SOW Content
        this.executiveSummary = data.executiveSummary || '';
        this.projectOverview = data.projectOverview || '';
        this.scope = data.scope || '';
        this.deliverables = data.deliverables || [];
        this.timeline = data.timeline || '';
        this.pricing = data.pricing || {
            subtotal: 0,
            tax: 0,
            total: 0,
            currency: 'USD'
        };
        this.assumptions = data.assumptions || '';
        this.risks = data.risks || '';
        this.nextSteps = data.nextSteps || '';
        
        // Services & Resources
        this.selectedServices = data.selectedServices || [];
        this.teamMembers = data.teamMembers || [];
        this.estimatedHours = data.estimatedHours || 0;
        
        // Research Integration
        this.researchUsed = data.researchUsed || [];
        this.personalizationLevel = data.personalizationLevel || 'basic';
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.createdBy = data.createdBy || 'System';
    }
    
    updateTimestamp() {
        this.updatedAt = new Date().toISOString();
    }
}

let clients = [];
let services = [];
let clientWorkspaces = new Map();

// Data Storage & Synchronization
export const DataManager = {
    // Save all data to localStorage
    saveToStorage() {
        localStorage.setItem('socialgarden_unified_clients', JSON.stringify(clients));
        localStorage.setItem('socialgarden_client_workspaces', JSON.stringify([...clientWorkspaces]));
        localStorage.setItem('socialgarden_services', JSON.stringify(services));
    },
    
    // Load data from localStorage
    loadFromStorage() {
        try {
            const savedClients = localStorage.getItem('socialgarden_unified_clients');
            if (savedClients) {
                const clientData = JSON.parse(savedClients);
                clients = clientData.map(data => new UnifiedClient(data));
            }
            
            const savedWorkspaces = localStorage.getItem('socialgarden_client_workspaces');
            if (savedWorkspaces) {
                clientWorkspaces = new Map(JSON.parse(savedWorkspaces));
            }
            
            const savedServices = localStorage.getItem('socialgarden_services');
            if (savedServices) {
                services = JSON.parse(savedServices);
            } else {
                // If no services in storage, load the default ones
                services = this.getDefaultServices();
                this.saveToStorage();
            }
        } catch (error) {
            console.error('Error loading data from storage:', error);
            // If loading fails, start with default data
            clients = [];
            clientWorkspaces = new Map();
            services = this.getDefaultServices();
        }
    },
    
    // Find client by ID
    getClientById(id) {
        return clients.find(client => client.id === id);
    },
    
    // Add or update client
    saveClient(clientData) {
        const existingIndex = clients.findIndex(c => c.id === clientData.id);
        const client = new UnifiedClient(clientData);
        
        if (existingIndex >= 0) {
            clients[existingIndex] = client;
        } else {
            clients.push(client);
        }
        
        this.saveToStorage();
        return client;
    },
      // Delete client
    deleteClient(id) {
        clients = clients.filter(c => c.id !== id);
        this.saveToStorage();
    },
    
    // Get all clients
    getAllClients() {
        return clients;
    },

    // Get all services
    getAllServices() {
        if (services.length === 0) {
            this.loadFromStorage();
        }
        return services;
    },

    // Get service by ID
    getServiceById(id) {
        return services.find(service => service.id === id);
    },
      // Get services by category
    getServicesByCategory(categoryId) {
        return services.filter(service => service.category === categoryId);
    },
    
    // Search clients
    searchClients(query, status) {
        const searchTerm = query.toLowerCase();
        return clients.filter(client => 
            (client.name.toLowerCase().includes(searchTerm) ||
            client.company.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            client.industry.toLowerCase().includes(searchTerm)) &&
            (!status || client.status === status)
        );
    },

    // Default services data
    getDefaultServices() {
        return [
            {
                id: 1,
                name: "Marketing Automation | Email Template Services",
                category: "Marketing Automation",
                pricing: "$9,350",
                hours: 70,
                avgRate: "$133.57",
                description: "Email Template Design, Development & Deployment with UX Design, Testing & Rendering",
                deliverables: [
                    "1x Email Template Design, Development & Deployment",
                    "Email Template Wireframe Design", 
                    "UX Design: Modular prototype in Figma (Max: 4 blocks, 30 modules)",
                    "Email Template Development & Testing",
                    "Email Template Deployment into Marketing Automation Platform"
                ],
                phases: ["Review existing template", "Objective setting", "Wireframe proposal", "User testing", "Go-live handover"],
                roles: [
                    { role: "Tech - Producer - Email Production", hours: 8, rate: 120 },
                    { role: "Tech - Producer - Design", hours: 8, rate: 120 },
                    { role: "Tech - Producer - Development", hours: 16, rate: 120 },
                    { role: "Tech - Producer - Testing", hours: 16, rate: 120 },
                    { role: "Account Management - Account Manager", hours: 8, rate: 180 }
                ]
            },
            // ... (The rest of the services objects from the original file)
            {
                id: 32,
                name: "Marketing Automation | HubSpot Full Implementation (All Hubs)",
                category: "Implementation & Setup",
                pricing: "$29,750", 
                hours: 150,
                avgRate: "$198",
                description: "Complete HubSpot implementation including Marketing Hub, Sales Hub, and Service Hub with training and support",
                deliverables: [
                    "Initial Account Customization and User Setup",
                    "Marketing Hub Implementation with Tracking and Domains",
                    "Sales Hub Implementation with Pipelines and Workflows",
                    "Service Hub Implementation with Inbox and Ticket Management",
                    "Reporting and Dashboards (4x custom reports max)",
                    "Go-Live, Deployment, and 2x Training Sessions",
                    "Resource Handover and Documentation"
                ],
                phases: ["Account Setup", "Marketing Hub", "Sales Hub", "Service Hub", "Reporting", "Training & Go-Live"],
                roles: [
                    { role: "Tech - Producer - Admin Configuration", hours: 30, rate: 120 },
                    { role: "Tech - Head Of - System Setup", hours: 20, rate: 365 },
                    { role: "Tech - Sr. Consultant - Advisory & Consultation", hours: 10, rate: 295 },
                    { role: "Tech - Specialist - Database Management", hours: 10, rate: 180 },
                    { role: "Tech - Specialist - Workflows", hours: 10, rate: 180 },
                    { role: "Tech - Specialist - Integration Services", hours: 10, rate: 190 },
                    { role: "Account Management - Account Manager", hours: 15, rate: 180 }
                ]
            }
        ];
    }
};

export const ANYTHINGLLM_CONFIG = {
    baseUrl: 'https://socialgarden-anything-llm.vo0egb.easypanel.host',
    apiKey: 'F7C84WV-75N4QWH-P9ERFRV-CWJ146T',
    workspace: 'main'
};

// --- API Functions ---

export async function callAnythingLLM(message, workspaceSlug = ANYTHINGLLM_CONFIG.workspace) {
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
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data.textResponse || data.message || 'No response received';
}

export async function aiAutofillClientData(linkedinUrl, websiteUrl) {
    const workspaceSlug = ANYTHINGLLM_CONFIG.workspace;
    let profileData = {};
    let companyData = {};

    // Process LinkedIn URL
    if (linkedinUrl) {
        try {
            const linkedinResponse = await callAnythingLLM(
                `@agent can you scrape the LinkedIn profile at ${linkedinUrl} and provide a detailed analysis including: full name, current job title and company, location, number of connections/followers, work experience summary, key skills and expertise, and education background. Please provide clear, detailed information for each section.`,
                workspaceSlug
            );
            profileData = parseLinkedInResponse(linkedinResponse);
        } catch (error) {
            console.error("LinkedIn scraping error:", error);
            // Handle error silently or with a notification
        }
    }

    // Process Website URL
    if (websiteUrl) {
        try {
            const websiteResponse = await callAnythingLLM(
                `@agent can you scrape the website ${websiteUrl} and extract the following company information in JSON format: name, industry, size, founded, overview, market, challenges, and opportunities? Please format as valid JSON.`,
                workspaceSlug
            );
            const jsonMatch = websiteResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                companyData = JSON.parse(jsonMatch[0]);
            } else {
                companyData = parseCompanyResponse(websiteResponse);
            }
        } catch (error) {
            console.error("Website scraping error:", error);
            // Handle error
        }
    }

    return { ...profileData, ...companyData };
}

// Helper parsers (can be improved with more robust logic)
function parseLinkedInResponse(text) {
    // This is a simplistic parser. A more robust solution would use regex or NLP.
    const data = {
        name: text.match(/Full name: (.*)/i)?.[1],
        headline: text.match(/Current job title and company: (.*)/i)?.[1],
        location: text.match(/Location: (.*)/i)?.[1],
        connections: text.match(/Number of connections\/followers: (.*)/i)?.[1],
        experience: text.match(/Work experience summary: ([\s\S]*?)Key skills/i)?.[1],
        skills: text.match(/Key skills and expertise: ([\s\S]*?)Education/i)?.[1],
        education: text.match(/Education background: ([\s\S]*)/i)?.[1],
    };
    return data;
}

function parseCompanyResponse(text) {
    // Fallback parser if JSON is not returned
    const data = {
        name: text.match(/name: "(.*?)"/i)?.[1],
        industry: text.match(/industry: "(.*?)"/i)?.[1],
        size: text.match(/size: "(.*?)"/i)?.[1],
        founded: text.match(/founded: "(.*?)"/i)?.[1],
        overview: text.match(/overview: "([\s\S]*?)"/i)?.[1],
        market: text.match(/market: "([\s\S]*?)"/i)?.[1],
        challenges: text.match(/challenges: "([\s\S]*?)"/i)?.[1],
        opportunities: text.match(/opportunities: "([\s\S]*?)"/i)?.[1],
    };
    return data;
}
