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

  const generateInnovations = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, this would call an AI service
      console.log('Innovation generation would happen here');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Service Innovation</h1>
        <button 
          onClick={generateInnovations}
          disabled={isGenerating}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Innovations'}
        </button>
      </div>

      {/* Innovation List or Empty State */}
      {innovations.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">💡</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No innovations yet</h3>
          <p className="text-gray-500 mb-4">
            Generate AI-powered service innovations to enhance your offerings.
          </p>
          <button 
            onClick={generateInnovations}
            disabled={isGenerating}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate First Innovation'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {innovations.map((innovation) => (
            <div 
              key={innovation.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{innovation.title}</h3>
              <p className="text-gray-600 mb-4">{innovation.description}</p>
              
              {innovation.benefits && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {innovation.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  innovation.complexity === 'High' ? 'bg-red-100 text-red-800' :
                  innovation.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {innovation.complexity} Complexity
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  innovation.impact === 'High' ? 'bg-green-100 text-green-800' :
                  innovation.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {innovation.impact} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evolution Timeline */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service Evolution Timeline</h2>
        {evolutionTimeline.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">No evolution timeline available yet. Generate innovations to see how services can evolve.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evolutionTimeline.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
