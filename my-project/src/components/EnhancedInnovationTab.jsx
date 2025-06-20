'use client';

import React, { useState, useEffect } from 'react';
import { dataManager } from '@/utils/enhanced-data-manager';

export default function EnhancedInnovationTab() {
  const [innovations, setInnovations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evolutionTimeline, setEvolutionTimeline] = useState([]);
  const [serviceEvolution, setServiceEvolution] = useState([]);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load any existing innovation data
    const services = dataManager.getServices();
    generateServiceEvolution(services);
  };

  const generateServiceEvolution = (services) => {
    if (services.length === 0) {
      setEvolutionTimeline([]);
      return;
    }

    // Create mock evolution timeline based on services
    const timeline = [
      {
        date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Foundation Services',
        description: 'Initial core service offerings established',
        stage: 'foundation',
        services: services.slice(0, Math.ceil(services.length * 0.3)),
      },
      {
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Service Enhancement',
        description: 'Expanded capabilities and improved delivery processes',
        stage: 'enhancement',
        services: services.slice(0, Math.ceil(services.length * 0.6)),
      },
      {
        date: new Date().toISOString().split('T')[0],
        title: 'AI Integration',
        description: 'Current state with AI-powered enhancements',
        stage: 'ai-integration',
        services: services,
      },
    ];

    setEvolutionTimeline(timeline);
  };

  const handleGenerateInnovations = async () => {
    setIsGenerating(true);
    try {
      const result = await dataManager.generateInnovations();
      
      if (result) {
        // Try to parse JSON from the AI response
        let newInnovations = [];
        try {
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            newInnovations = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: parse text response into innovations
            newInnovations = parseInnovationsFromText(result);
          }
        } catch (parseError) {
          newInnovations = parseInnovationsFromText(result);
        }

        setInnovations(prev => [...prev, ...newInnovations]);
      } else {
        // Fallback innovations if AI service is not available
        const fallbackInnovations = generateFallbackInnovations();
        setInnovations(prev => [...prev, ...fallbackInnovations]);
      }
    } catch (error) {
      console.error('Innovation generation failed:', error);
      // Show fallback innovations
      const fallbackInnovations = generateFallbackInnovations();
      setInnovations(prev => [...prev, ...fallbackInnovations]);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseInnovationsFromText = (text) => {
    // Simple text parsing for innovation suggestions
    const lines = text.split('\n').filter(line => line.trim());
    const innovations = [];
    let currentInnovation = null;

    lines.forEach(line => {
      line = line.trim();
      if (line.includes('Title:') || line.includes('Name:') || line.match(/^\d+\./)) {
        if (currentInnovation) {
          innovations.push(currentInnovation);
        }
        currentInnovation = {
          id: Date.now() + innovations.length,
          title: line.replace(/^(\d+\.|Title:|Name:)/, '').trim(),
          description: '',
          benefits: [],
          complexity: 'Medium',
          impact: 'Medium',
        };
      } else if (currentInnovation) {
        if (line.includes('Description:')) {
          currentInnovation.description = line.replace('Description:', '').trim();
        } else if (line.includes('Benefits:')) {
          currentInnovation.benefits = [line.replace('Benefits:', '').trim()];
        } else if (line.includes('Complexity:')) {
          currentInnovation.complexity = line.replace('Complexity:', '').trim();
        } else if (line.includes('Impact:')) {
          currentInnovation.impact = line.replace('Impact:', '').trim();
        } else if (!line.includes(':') && line.length > 10) {
          currentInnovation.description += ' ' + line;
        }
      }
    });

    if (currentInnovation) {
      innovations.push(currentInnovation);
    }

    return innovations.length > 0 ? innovations : generateFallbackInnovations();
  };

  const generateFallbackInnovations = () => {
    return [
      {
        id: Date.now() + 1,
        title: 'AI-Powered Service Recommendation Engine',
        description: 'Develop an intelligent system that analyzes client data and automatically recommends the most suitable services based on industry trends, past performance, and client-specific needs.',
        benefits: [
          'Improved service matching accuracy',
          'Reduced consultation time',
          'Higher client satisfaction',
          'Increased upselling opportunities'
        ],
        complexity: 'High',
        impact: 'High',
        category: 'AI Enhancement',
        estimatedTimeline: '3-4 months',
        technicalRequirements: ['Machine Learning Platform', 'Data Analytics', 'API Integration']
      },
      {
        id: Date.now() + 2,
        title: 'Automated Client Onboarding Workflow',
        description: 'Create a streamlined, automated process for client onboarding that includes document collection, initial assessment, and service setup using AI-powered form processing.',
        benefits: [
          'Reduced manual work',
          'Faster client activation',
          'Consistent onboarding experience',
          'Improved data accuracy'
        ],
        complexity: 'Medium',
        impact: 'High',
        category: 'Process Automation',
        estimatedTimeline: '2-3 months',
        technicalRequirements: ['Workflow Engine', 'Document Processing', 'Integration APIs']
      },
      {
        id: Date.now() + 3,
        title: 'Predictive Performance Dashboard',
        description: 'Build an advanced analytics dashboard that predicts service performance, identifies potential issues, and suggests optimizations before problems occur.',
        benefits: [
          'Proactive issue resolution',
          'Improved service quality',
          'Better resource allocation',
          'Enhanced client retention'
        ],
        complexity: 'High',
        impact: 'Medium',
        category: 'Analytics',
        estimatedTimeline: '4-5 months',
        technicalRequirements: ['Data Warehouse', 'Predictive Analytics', 'Visualization Tools']
      }
    ];
  };

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    try {
      const services = dataManager.getServices();
      const clients = dataManager.getClients();
      
      const trendPrompt = `
        Analyze current market trends and opportunities based on our service portfolio and client base:
        
        Services: ${services.map(s => s.name).join(', ')}
        Client Industries: ${[...new Set(clients.map(c => c.industry))].join(', ')}
        
        Please provide:
        1. Market trend analysis
        2. Emerging opportunities
        3. Technology disruptions to watch
        4. Competitive landscape insights
        5. Recommendations for new service development
      `;
      
      const result = await dataManager.sendChatMessage(trendPrompt);
      setTrendAnalysis(result?.textResponse || result?.response || 'Trend analysis completed.');
      
    } catch (error) {
      console.error('Trend analysis failed:', error);
      setTrendAnalysis('Unable to perform trend analysis. Please check your AI service configuration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToKnowledgeBase = (innovation) => {
    // Add innovation as a new service
    const service = {
      name: innovation.title,
      description: innovation.description,
      category: innovation.category || 'Innovation',
      price: null, // To be determined
      complexity: innovation.complexity,
      benefits: innovation.benefits,
    };
    
    dataManager.addService(service);
    alert(`"${innovation.title}" has been added to your knowledge base as a new service!`);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'very high': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'very high': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Innovation Lab</h1>
          <p className="text-gray-600">Discover AI-powered enhancements and new service opportunities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAnalyzeTrends}
            disabled={isAnalyzing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>📈</span>
                <span>Analyze Trends</span>
              </>
            )}
          </button>
          <button
            onClick={handleGenerateInnovations}
            disabled={isGenerating}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>💡</span>
                <span>Generate Ideas</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Innovation Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                💡
              </span>
              AI Enhancement Suggestions
            </h2>
            
            {innovations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-xl mb-2">No innovation suggestions yet</p>
                <p className="text-sm mb-4">Click "Generate Ideas" to get AI-powered innovation suggestions</p>
                <button
                  onClick={handleGenerateInnovations}
                  disabled={isGenerating}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Innovation Ideas'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {innovations.map(innovation => (
                  <div key={innovation.id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{innovation.title}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(innovation.impact)}`}>
                          {innovation.impact} Impact
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(innovation.complexity)}`}>
                          {innovation.complexity} Complexity
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{innovation.description}</p>
                    
                    {innovation.benefits && innovation.benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {innovation.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {innovation.technicalRequirements && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {innovation.technicalRequirements.map((req, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {innovation.estimatedTimeline && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">
                          <strong>Timeline:</strong> {innovation.estimatedTimeline}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Category: {innovation.category || 'General Enhancement'}
                      </span>
                      <button 
                        onClick={() => handleAddToKnowledgeBase(innovation)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <span>➕</span>
                        <span>Add to Knowledge Base</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trend Analysis */}
          {trendAnalysis && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                  📈
                </span>
                Market Trends
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {trendAnalysis}
                </div>
              </div>
            </div>
          )}

          {/* Service Evolution Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                📊
              </span>
              Service Evolution
            </h3>
            
            {evolutionTimeline.length > 0 ? (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Events */}
                <div className="space-y-6">
                  {evolutionTimeline.map((event, index) => (
                    <div key={index} className="relative pl-10">
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow ${
                        event.stage === 'foundation' ? 'bg-gray-500' :
                        event.stage === 'enhancement' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      
                      {/* Event Content */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {event.services?.length || 0} services
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No service evolution data available yet.</p>
                <p className="text-xs mt-1">Add services to see timeline</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Innovation Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ideas Generated</span>
                <span className="font-semibold text-gray-900">{innovations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">High Impact Ideas</span>
                <span className="font-semibold text-green-600">
                  {innovations.filter(i => i.impact?.toLowerCase() === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Complexity Ideas</span>
                <span className="font-semibold text-blue-600">
                  {innovations.filter(i => i.complexity?.toLowerCase() === 'low').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
