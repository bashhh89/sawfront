'use client';

import React, { useState, useEffect } from 'react';
import { DataManager } from '@/utils/dataManager';

export default function InnovationTab() {
  const [innovations, setInnovations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evolutionTimeline, setEvolutionTimeline] = useState([]);
  useEffect(() => {
    // Initialize with empty arrays - no mock data
    setInnovations([]);
    setEvolutionTimeline([]);
  }, []);
  }, []);
    const handleGenerateInnovations = () => {
    setIsGenerating(true);
    
    // Simulate API call delay (in real app, this would call your AI service)
    setTimeout(() => {
      // In a real application, this would call an AI service to generate innovations
      // For now, we'll just show that the function completed without mock data
      setIsGenerating(false);
      
      // Show a message that no innovations were generated yet
      console.log('Innovation generation completed - integrate with real AI service');
    }, 2000);
  };
  
  const handleAddToKnowledgeBase = (innovation) => {
    alert(`Added "${innovation.title}" to the Knowledge Base!`);
    // In a real app, this would call an API to add the innovation to the knowledge base
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Innovation Suggestions */}
      <div className="glass-effect rounded-xl shadow-lg card-elevated p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center mr-3">
            💡
          </span>
          AI Enhancement Suggestions
        </h2>
        
        <div className="space-y-6">
          {innovations.map(innovation => (
            <div key={innovation.id} className="innovation-card bg-white p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900">{innovation.title}</h3>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${innovation.impact === 'High' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {innovation.impact} Impact
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${innovation.complexity === 'High' || innovation.complexity === 'Very High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {innovation.complexity} Complexity
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm my-3">{innovation.description}</p>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Benefits:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {innovation.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <button 
                onClick={() => handleAddToKnowledgeBase(innovation)}
                className="add-to-kb-btn mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add to Knowledge Base
              </button>
            </div>
          ))}
          
          {innovations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">No innovation suggestions yet</p>
              <p className="text-sm">Click the button below to generate AI-powered ideas</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleGenerateInnovations}
          disabled={isGenerating}
          className={`w-full mt-6 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Ideas...
            </span>
          ) : 'Generate New AI Enhancement Ideas'}
        </button>
      </div>
      
      {/* Service Evolution */}
      <div className="glass-effect rounded-xl shadow-lg card-elevated p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center mr-3">
            📈
          </span>
          Service Evolution
        </h2>
        
        <div className="space-y-4">
          {evolutionTimeline.length > 0 ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline Events */}
              <div className="space-y-8">
                {evolutionTimeline.map((event, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow"></div>
                    
                    {/* Event Content */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-12">No service evolution data available yet.</p>
          )}
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">AI Insight</h3>
            <p className="text-sm text-blue-700">
              Based on your service evolution, we recommend focusing on AI-powered automation next to enhance service delivery efficiency and scale your offerings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
