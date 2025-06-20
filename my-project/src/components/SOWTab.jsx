'use client';

import React, { useState, useEffect } from 'react';
import { DataManager } from '@/utils/dataManager';
import { AdvancedSOWGenerator } from '@/utils/advanced-sow-generator';

export default function SOWTab() {
  // State management
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [projectData, setProjectData] = useState({
    title: '',
    type: 'marketing',
    budget: '',
    timeline: '4-6 weeks',
    objectives: '',
    requirements: ''
  });
  
  // SOW Generation
  const [sowContent, setSOWContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [shareData, setShareData] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('setup');
  const [template, setTemplate] = useState('professional');
  
  const sowGenerator = new AdvancedSOWGenerator({
    baseUrl: process.env.NEXT_PUBLIC_ANYTHINGLLM_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_ANYTHINGLLM_API_KEY,
    workspace: process.env.NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const dataManager = new DataManager();
    const clientData = dataManager.getClients();
    const serviceData = dataManager.getServices();
    
    setClients(clientData);
    setServices(serviceData);
  };

  const handleGenerateSOW = async () => {
    if (!selectedClient || selectedServices.length === 0) {
      alert('Please select a client and at least one service');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Get selected service objects
      const selectedServiceObjects = services.filter(service => 
        selectedServices.includes(service.id)
      );

      // Generate SOW using AnythingLLM
      const result = await generateSOWWithAnythingLLM(
        selectedClient,
        projectData,
        selectedServiceObjects
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setSOWContent(result);
      setActiveTab('preview');
      
    } catch (error) {
      console.error('SOW Generation failed:', error);
      alert(`Failed to generate SOW: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const generateSOWWithAnythingLLM = async (clientData, projectData, serviceData) => {
    const prompt = `
You are the SOW Generation Agent for Social Garden. Generate a comprehensive, professional Statement of Work document.

CLIENT INFORMATION:
- Company: ${clientData.name || 'Client Company'}
- Industry: ${clientData.industry || 'Not specified'}
- Contact: ${clientData.contact || 'Primary Contact'}
- Location: ${clientData.location || 'Not specified'}
- Background: ${clientData.background || 'No additional background provided'}

PROJECT DETAILS:
- Title: ${projectData.title}
- Type: ${projectData.type}
- Budget: $${projectData.budget}
- Timeline: ${projectData.timeline}
- Objectives: ${projectData.objectives}
- Requirements: ${projectData.requirements}

SELECTED SERVICES:
${serviceData.map(service => `
- Service: ${service.name}
- Description: ${service.description}
- Rate: $${service.rate}/hour
- Estimated Hours: ${service.estimatedHours || 20}
`).join('\n')}

Please generate a complete SOW document including:
1. Executive Summary
2. Project Objectives
3. Scope of Work (detailed breakdown)
4. Deliverables
5. Timeline and Milestones
6. Investment Breakdown (using granular roles and rates)
7. Terms and Conditions
8. Next Steps

Use Social Garden's professional tone and ensure all pricing follows the OakTree Principle with proper management layers.

Format the response in a structured way that can be easily parsed and converted to PDF.
`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ANYTHINGLLM_BASE_URL}/api/v1/workspace/${process.env.NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ANYTHINGLLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode: 'chat'
        })
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status}`);
      }

      const result = await response.json();
      const sowContent = result.textResponse || result.response || '';
      
      return parseSOWContent(sowContent, clientData, projectData);
    } catch (error) {
      console.error('AnythingLLM API Error:', error);
      throw new Error(`Failed to generate SOW: ${error.message}`);
    }
  };

  const parseSOWContent = (content, clientData, projectData) => {
    const sections = {
      executiveSummary: '',
      objectives: '',
      scope: '',
      deliverables: '',
      timeline: '',
      investment: '',
      terms: '',
      nextSteps: ''
    };

    // Use regex patterns to extract sections
    const patterns = {
      executiveSummary: /(?:Executive Summary|EXECUTIVE SUMMARY)(.*?)(?=Project Objectives|OBJECTIVES|Scope|$)/is,
      objectives: /(?:Project Objectives|OBJECTIVES)(.*?)(?=Scope of Work|SCOPE|Deliverables|$)/is,
      scope: /(?:Scope of Work|SCOPE)(.*?)(?=Deliverables|DELIVERABLES|Timeline|$)/is,
      deliverables: /(?:Deliverables|DELIVERABLES)(.*?)(?=Timeline|TIMELINE|Investment|$)/is,
      timeline: /(?:Timeline|TIMELINE)(.*?)(?=Investment|INVESTMENT|Terms|$)/is,
      investment: /(?:Investment|INVESTMENT|Pricing)(.*?)(?=Terms|TERMS|Next Steps|$)/is,
      terms: /(?:Terms|TERMS)(.*?)(?=Next Steps|NEXT STEPS|$)/is,
      nextSteps: /(?:Next Steps|NEXT STEPS)(.*?)$/is
    };

    Object.keys(patterns).forEach(section => {
      const match = content.match(patterns[section]);
      if (match) {
        sections[section] = match[1].trim();
      }
    });

    return {
      fullContent: content,
      sections,
      clientName: clientData.name,
      projectTitle: projectData.title,
      totalInvestment: projectData.budget,
      metadata: {
        generatedAt: new Date().toISOString(),
        wordCount: content.split(' ').length,
        pageEstimate: Math.ceil(content.split(' ').length / 250)
      }
    };
  };

  const handleExportPDF = async () => {
    if (!sowContent) return;
    
    setIsExporting(true);
    try {
      await sowGenerator.downloadPDF(sowContent, `SOW_${selectedClient.name}_${Date.now()}.pdf`, template);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!sowContent) return;
    
    setIsExporting(true);
    try {
      sowGenerator.downloadExcel(sowContent, `SOW_${selectedClient.name}_${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Excel Export failed:', error);
      alert('Failed to export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!sowContent) return;
    
    try {
      const shareResult = await sowGenerator.generateShareableLink(sowContent, 30);
      setShareData(shareResult);
    } catch (error) {
      console.error('Share link generation failed:', error);
      alert('Failed to generate share link');
    }
  };

  const handleEmailSOW = async () => {
    if (!sowContent || !selectedClient.email) {
      alert('Client email is required');
      return;
    }

    try {
      const emailData = {
        recipients: [selectedClient.email],
        subject: `SOW: ${projectData.title}`,
        message: `Dear ${selectedClient.name},\n\nPlease find attached the Statement of Work for ${projectData.title}.\n\nBest regards,\nSocial Garden Team`
      };

      await sowGenerator.emailPDF(sowContent, emailData, template);
      alert('SOW has been prepared for email delivery');
    } catch (error) {
      console.error('Email preparation failed:', error);
      alert('Failed to prepare email');
    }
  };
  
  const handleAISuggestServices = () => {
    // Simulate AI suggesting services based on project type and client
    if (projectType && selectedClient) {
      let suggestedServiceIds = [];
      
      switch(projectType) {
        case 'marketing-automation':
          suggestedServiceIds = [1, 2, 3];
          break;
        case 'web-development':
          suggestedServiceIds = [5, 6];
          break;
        case 'ai-implementation':
          suggestedServiceIds = [7, 2];
          break;
        case 'crm-setup':
          suggestedServiceIds = [2, 1];
          break;
        default:
          suggestedServiceIds = [3, 4, 5];
      }
      
      setSelectedServices(suggestedServiceIds);
    }
  };
  
  const handleGenerateSOW = () => {
    if (!selectedClient || !projectTitle || !projectType || !budget || !projectBrief || selectedServices.length === 0) {
      alert('Please fill in all required fields and select at least one service.');
      return;
    }
    
    setIsGenerating(true);
    setShowResearchProgress(true);
    
    // Simulate research progress steps
    const steps = [
      'Analyzing client industry context...',
      'Researching market trends for project type...',
      'Calculating optimal project timeline...',
      'Determining key deliverables...',
      'Generating comprehensive SOW document...'
    ];
    
    // Simulate progress updates
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setResearchProgress(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(progressInterval);
        generateSOWPreview();
      }
    }, 1000);
  };
  
  const generateSOWPreview = () => {
    // Get selected service details
    const servicesDetails = selectedServices.map(id => {
      const service = availableServices.find(s => s.id === id);
      return service;
    });
    
    // Calculate total price
    const totalPrice = servicesDetails.reduce((sum, service) => sum + service.price, 0);
    
    // Generate SOW content
    const sowContent = `
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-2xl font-bold text-gray-900">Statement of Work</h1>
          <p class="text-gray-500">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Client Information</h2>
            <p><strong>Client:</strong> ${selectedClient.name}</p>
            <p><strong>Industry:</strong> ${selectedClient.industry}</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Project Overview</h2>
            <p><strong>Project Name:</strong> ${projectTitle}</p>
            <p><strong>Type:</strong> ${projectType}</p>
            <p><strong>Budget:</strong> $${budget}</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Project Brief</h2>
            <p>${projectBrief}</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Services & Deliverables</h2>
            <ul class="list-disc pl-5 space-y-2">
              ${servicesDetails.map(service => `
                <li>
                  <strong>${service.name}</strong> - $${service.price}
                </li>
              `).join('')}
            </ul>
            <p class="font-bold mt-4">Total: $${totalPrice}</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Timeline</h2>
            <p>Project Start: Upon signature</p>
            <p>Estimated Duration: 8-10 weeks</p>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-800">Terms & Conditions</h2>
            <p>This SOW is subject to the terms and conditions of the Master Services Agreement between the parties.</p>
          </div>
        </div>
        
        <div class="border-t pt-6 mt-8">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Client Signature:</strong></p>
              <div class="h-12 border-b border-gray-300 mt-6"></div>
              <p class="text-sm text-gray-500">Date: ____________</p>
            </div>
            <div>
              <p><strong>Service Provider Signature:</strong></p>
              <div class="h-12 border-b border-gray-300 mt-6"></div>
              <p class="text-sm text-gray-500">Date: ____________</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    setSowPreview(sowContent);
    setIsGenerating(false);
  };
  
  const handleSaveDraft = () => {
    alert('Draft saved successfully!');
    // In a real app, this would save the current state to a database
  };
  
  const handleExportPDF = () => {
    alert('Exporting to PDF...');
    // In a real app, this would use jsPDF and html2canvas to generate a PDF
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">SOW Generator</h1>
        <p className="text-gray-600">AI-powered Statement of Work generation with advanced export capabilities</p>
      </div>

      {/* Progress Indicator */}
      {isGenerating && (
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Generating SOW with AnythingLLM...</span>
            <span className="text-sm text-gray-500">{generationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {['setup', 'preview', 'export'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'preview' && !sowContent}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {tab === 'setup' && '1. Setup'}
            {tab === 'preview' && '2. Preview'}
            {tab === 'export' && '3. Export & Share'}
          </button>
        ))}
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                <select
                  value={selectedClient?.id || ''}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === parseInt(e.target.value));
                    setSelectedClient(client);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company || 'No Company'}
                    </option>
                  ))}
                </select>
              </div>

              {clients.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No clients available. Add clients first to generate SOWs.</p>
                </div>
              )}

              {selectedClient && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">{selectedClient.name}</h4>
                  <p className="text-sm text-gray-600">{selectedClient.company}</p>
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter project title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select
                  value={projectData.type}
                  onChange={(e) => setProjectData(prev => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="marketing">Marketing Automation</option>
                  <option value="consultation">Strategic Consultation</option>
                  <option value="managed">Managed Services</option>
                  <option value="custom">Custom Solution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <input
                  type="text"
                  value={projectData.budget}
                  onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., $15,000 - $25,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                <select
                  value={projectData.timeline}
                  onChange={(e) => setProjectData(prev => ({ ...prev, timeline: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="2-3 weeks">2-3 weeks</option>
                  <option value="4-6 weeks">4-6 weeks</option>
                  <option value="6-8 weeks">6-8 weeks</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Objectives</label>
                <textarea
                  value={projectData.objectives}
                  onChange={(e) => setProjectData(prev => ({ ...prev, objectives: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe the main objectives and goals..."
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Selection</h3>
              
              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No services available</p>
                  <p className="text-sm">Add services to the knowledge base to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedServices(prev => 
                          prev.includes(service.id)
                            ? prev.filter(id => id !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                    >
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <p className="text-sm font-medium text-primary mt-2">${service.rate}/hour</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="lg:col-span-2">
            <button
              onClick={handleGenerateSOW}
              disabled={!selectedClient || selectedServices.length === 0 || isGenerating}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating SOW with AI...' : 'Generate SOW with AnythingLLM'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && sowContent && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">SOW Preview</h3>
              <div className="flex space-x-2">
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="modern">Modern</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Document Info</h4>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <p className="font-medium">{selectedClient?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <p className="font-medium">{projectData.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Generated:</span>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {sowContent.sections?.executiveSummary && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Executive Summary</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.executiveSummary}</div>
                  </section>
                )}

                {sowContent.sections?.objectives && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Project Objectives</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.objectives}</div>
                  </section>
                )}

                {sowContent.sections?.scope && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Scope of Work</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.scope}</div>
                  </section>
                )}

                {sowContent.sections?.deliverables && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Deliverables</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.deliverables}</div>
                  </section>
                )}

                {sowContent.sections?.timeline && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Timeline & Milestones</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.timeline}</div>
                  </section>
                )}

                {sowContent.sections?.investment && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Investment Breakdown</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.investment}</div>
                  </section>
                )}

                {sowContent.sections?.terms && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Terms & Conditions</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.terms}</div>
                  </section>
                )}

                {sowContent.sections?.nextSteps && (
                  <section>
                    <h3 className="text-xl font-semibold text-primary mb-3">Next Steps</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">{sowContent.sections.nextSteps}</div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && sowContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Options */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export as PDF'}
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export as Excel'}
              </button>

              <button
                onClick={handleEmailSOW}
                disabled={!selectedClient?.email}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email to Client
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Options</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleGenerateShareLink}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Generate Share Link
              </button>

              {shareData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Share Link Generated</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareData.shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(shareData.shareUrl)}
                        className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(shareData.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Content State */}
      {activeTab === 'preview' && !sowContent && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SOW Generated Yet</h3>
          <p className="text-gray-600 mb-4">Complete the setup and generate your SOW to see the preview</p>
          <button
            onClick={() => setActiveTab('setup')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Setup
          </button>
        </div>
      )}
    </div>
  );
}
