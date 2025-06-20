'use client';

import React, { useState, useEffect } from 'react';
import { dataManager } from '@/utils/enhanced-data-manager';

export default function EnhancedSOWTab() {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [projectBrief, setProjectBrief] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [generatedSOW, setGeneratedSOW] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchInsights, setResearchInsights] = useState(null);
  const [savedSOWs, setSavedSOWs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataManager.getClients());
    setServices(dataManager.getServices());
    setSavedSOWs(dataManager.getSOWs());
  };

  const handleClientSelection = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    setSelectedClient(client);
    
    if (client) {
      // Auto-research client when selected
      performClientResearch(client);
    }
  };

  const performClientResearch = async (client) => {
    setIsResearching(true);
    try {
      const analysis = await dataManager.analyzeClient(client.id);
      if (analysis) {
        setResearchInsights(analysis.textResponse || analysis.response);
        
        // Auto-suggest services based on client analysis
        suggestServicesForClient(client);
      }
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const suggestServicesForClient = (client) => {
    // Simple service suggestion based on industry
    const industryMapping = {
      'technology': ['digital-strategy', 'automation', 'ai-integration'],
      'healthcare': ['compliance-audit', 'digital-transformation', 'workflow-optimization'],
      'finance': ['security-audit', 'process-automation', 'reporting-dashboard'],
      'retail': ['e-commerce-optimization', 'customer-analytics', 'inventory-management'],
      'manufacturing': ['process-optimization', 'quality-management', 'predictive-maintenance'],
    };

    const clientIndustry = client.industry?.toLowerCase() || '';
    const suggestedServiceTypes = industryMapping[clientIndustry] || [];
    
    const suggested = services.filter(service => 
      suggestedServiceTypes.some(type => 
        service.name.toLowerCase().includes(type.replace('-', ' ')) ||
        service.category?.toLowerCase().includes(type.replace('-', ' '))
      )
    );

    if (suggested.length > 0) {
      setSelectedServices(suggested.slice(0, 3).map(s => s.id));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const generateSOW = async () => {
    if (!selectedClient || selectedServices.length === 0 || !projectBrief) {
      alert('Please select a client, services, and provide a project brief.');
      return;
    }

    setIsGenerating(true);
    try {
      const sow = await dataManager.generateSOW(
        selectedClient.id,
        selectedServices,
        projectBrief
      );

      if (sow) {
        setGeneratedSOW(sow);
        loadData(); // Refresh saved SOWs
      }
    } catch (error) {
      console.error('SOW generation failed:', error);
      alert('Failed to generate SOW. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSOWDraft = () => {
    if (generatedSOW) {
      const updatedSOW = dataManager.updateSOW(generatedSOW.id, {
        projectTitle,
        budget: budget ? parseFloat(budget) : undefined,
        timeline,
        status: 'draft',
      });
      
      if (updatedSOW) {
        alert('SOW draft saved successfully!');
        loadData();
      }
    }
  };

  const exportSOWToPDF = () => {
    if (!generatedSOW) return;

    // Create a simple HTML document for PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Statement of Work - ${selectedClient?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .service-list { margin-left: 20px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Statement of Work</h1>
          <h2>${projectTitle || 'Digital Services Project'}</h2>
          <p><strong>Client:</strong> ${selectedClient.name} - ${selectedClient.company}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Project Overview</h2>
          <p>${projectBrief}</p>
        </div>

        <div class="section">
          <h2>Selected Services</h2>
          <div class="service-list">
            ${services.filter(s => selectedServices.includes(s.id))
              .map(service => `
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                ${service.price ? `<p><strong>Price:</strong> $${service.price}</p>` : ''}
              `).join('')}
          </div>
        </div>

        ${budget ? `
        <div class="section">
          <h2>Budget</h2>
          <p><strong>Estimated Budget:</strong> $${budget}</p>
        </div>` : ''}

        ${timeline ? `
        <div class="section">
          <h2>Timeline</h2>
          <p>${timeline}</p>
        </div>` : ''}

        <div class="section">
          <h2>AI-Generated Content</h2>
          <div>${generatedSOW.content.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="footer">
          <p>Generated by Social Garden AI Knowledge Base</p>
          <p>${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOW-${selectedClient?.name?.replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySOWToClipboard = () => {
    if (!generatedSOW) return;

    const textContent = `
STATEMENT OF WORK
${projectTitle || 'Digital Services Project'}

Client: ${selectedClient?.name} - ${selectedClient?.company}
Date: ${new Date().toLocaleDateString()}

PROJECT OVERVIEW:
${projectBrief}

SELECTED SERVICES:
${services.filter(s => selectedServices.includes(s.id))
  .map(service => `
- ${service.name}
  ${service.description}
  ${service.price ? `Price: $${service.price}` : ''}
`).join('')}

${budget ? `BUDGET: $${budget}` : ''}
${timeline ? `TIMELINE: ${timeline}` : ''}

AI-GENERATED CONTENT:
${generatedSOW.content}

Generated by Social Garden AI Knowledge Base
${new Date().toLocaleDateString()}
    `;

    navigator.clipboard.writeText(textContent).then(() => {
      alert('SOW copied to clipboard!');
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOW Generator</h1>
          <p className="text-gray-600">Create AI-powered Statements of Work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOW Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Client</h2>
            
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No clients available. Please add clients first.</p>
                <a 
                  href="/clients" 
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add Clients
                </a>
              </div>
            ) : (
              <div>
                <select
                  value={selectedClient?.id || ''}
                  onChange={(e) => handleClientSelection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company} ({client.industry})
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Client Information</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Company:</strong> {selectedClient.company}</p>
                      <p><strong>Industry:</strong> {selectedClient.industry}</p>
                      <p><strong>Status:</strong> {selectedClient.status}</p>
                      {selectedClient.dealValue && (
                        <p><strong>Deal Value:</strong> ${selectedClient.dealValue}</p>
                      )}
                    </div>
                    
                    {isResearching && (
                      <div className="mt-3 flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
                        <span className="text-sm">Researching client...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Select Services</h2>
            
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No services available. Please add services to your knowledge base.</p>
                <a 
                  href="/knowledge" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Services
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(service => (
                  <div key={service.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          {service.category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {service.category}
                            </span>
                          )}
                        </div>
                        {service.price && (
                          <span className="text-green-600 font-medium">${service.price}</span>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Project Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Digital Transformation Initiative"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="3-6 months"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Brief *
                </label>
                <textarea
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="Describe the project objectives, requirements, and expected outcomes..."
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={generateSOW}
              disabled={!selectedClient || selectedServices.length === 0 || !projectBrief || isGenerating}
              className="mt-6 w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating SOW with AI...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Generate SOW with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar - Research & SOW Preview */}
        <div className="space-y-6">
          {/* Client Research */}
          {researchInsights && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Client Research</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800 whitespace-pre-wrap">
                  {researchInsights.substring(0, 300)}...
                </div>
              </div>
            </div>
          )}

          {/* Saved SOWs */}
          {savedSOWs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Recent SOWs</h3>
              <div className="space-y-2">
                {savedSOWs.slice(0, 5).map(sow => (
                  <div key={sow.id} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <h4 className="font-medium text-gray-900">{sow.client?.name}</h4>
                    <p className="text-sm text-gray-600">{sow.client?.company}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sow.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated SOW Preview */}
      {generatedSOW && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated SOW Preview</h2>
            <div className="flex space-x-2">
              <button
                onClick={saveSOWDraft}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Save Draft
              </button>
              <button
                onClick={copySOWToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={exportSOWToPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                📄 Export HTML
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="prose prose-lg max-w-none">
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">Statement of Work</h1>
                <h2 className="text-xl text-gray-700 mt-2">{projectTitle || 'Digital Services Project'}</h2>
                <p className="text-gray-600 mt-2">
                  <strong>Client:</strong> {selectedClient?.name} - {selectedClient?.company}
                </p>
                <p className="text-gray-600">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="whitespace-pre-wrap text-gray-800">
                {generatedSOW.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
