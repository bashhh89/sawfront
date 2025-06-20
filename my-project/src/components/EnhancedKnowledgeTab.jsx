'use client';

import React, { useState, useEffect, useRef } from 'react';
import { dataManager } from '@/utils/enhanced-data-manager';

export default function EnhancedKnowledgeTab() {
  const [view, setView] = useState('tree'); // tree, network, categories
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI assistant for the Knowledge Base. Upload documents and I'll help you analyze and organize your knowledge! 🚀",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [serviceData, setServiceData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const visualizationRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadData();
    loadDocuments();
  }, []);

  useEffect(() => {
    if (serviceData && visualizationRef.current) {
      renderVisualization();
    }
  }, [view, serviceData]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadData = () => {
    const data = dataManager.getHierarchicalData();
    setServiceData(data);
  };

  const loadDocuments = async () => {
    try {
      // In a real implementation, this would fetch from AnythingLLM
      setDocuments([]);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderVisualization = () => {
    if (!visualizationRef.current) return;

    const container = visualizationRef.current;
    container.innerHTML = '';

    if (!serviceData || !serviceData.children || serviceData.children.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-400">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-xl mb-2">No Knowledge Data</p>
          <p class="text-sm">Upload documents or add services to see visualizations</p>
          <button onclick="document.getElementById('file-upload').click()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Upload Documents
          </button>
        </div>
      `;
      return;
    }

    const width = container.clientWidth;
    const height = 400;

    // Create SVG
    const svg = document.createElement('div');
    svg.innerHTML = `
      <svg width="${width}" height="${height}" class="border rounded-lg bg-white">
        <g class="visualization-content"></g>
      </svg>
    `;
    container.appendChild(svg);

    if (view === 'tree') {
      renderTreeView(svg.querySelector('.visualization-content'), width, height);
    } else if (view === 'network') {
      renderNetworkView(svg.querySelector('.visualization-content'), width, height);
    } else if (view === 'categories') {
      renderCategoryView(container, width, height);
    }
  };

  const renderTreeView = (svgElement, width, height) => {
    // Simple tree visualization without D3
    svgElement.innerHTML = `
      <text x="${width/2}" y="30" text-anchor="middle" class="text-lg font-bold fill-gray-800">
        Service Knowledge Tree
      </text>
      <text x="${width/2}" y="200" text-anchor="middle" class="text-sm fill-gray-500">
        Tree view visualization will be rendered here
      </text>
    `;
  };

  const renderNetworkView = (svgElement, width, height) => {
    svgElement.innerHTML = `
      <text x="${width/2}" y="30" text-anchor="middle" class="text-lg font-bold fill-gray-800">
        Service Network Graph
      </text>
      <text x="${width/2}" y="200" text-anchor="middle" class="text-sm fill-gray-500">
        Network view visualization will be rendered here
      </text>
    `;
  };

  const renderCategoryView = (container, width, height) => {
    const categories = serviceData.children || [];
    
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4';
    
    categories.forEach(category => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer';
      categoryCard.innerHTML = `
        <h3 class="font-semibold text-gray-900 mb-2">${category.name}</h3>
        <p class="text-sm text-gray-600">${category.children?.length || 0} services</p>
        <div class="mt-2 text-xs text-gray-500">
          ${category.children?.slice(0, 3).map(service => service.name).join(', ')}
          ${category.children?.length > 3 ? '...' : ''}
        </div>
      `;
      
      categoryCard.addEventListener('click', () => {
        setSelectedService(category);
      });
      
      categoryGrid.appendChild(categoryCard);
    });
    
    container.appendChild(categoryGrid);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await dataManager.sendChatMessage(chatInput);
      
      const aiMessage = {
        sender: 'ai',
        text: response?.textResponse || response?.response || "I'm here to help with your knowledge base. Upload some documents and I can provide better insights!",
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        sender: 'ai',
        text: "I'm having trouble connecting to the AI service. Please check your AnythingLLM configuration.",
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        const result = await dataManager.uploadClientDocument(null, file);
        if (result) {
          setDocuments(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          }]);
        }
      }
      
      loadData(); // Refresh data
      
      const uploadMessage = {
        sender: 'ai',
        text: `Great! I've processed ${files.length} document(s). The knowledge base has been updated with new information. You can now ask me questions about the uploaded content.`,
      };
      setChatMessages(prev => [...prev, uploadMessage]);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = {
        sender: 'ai',
        text: "Sorry, there was an error uploading your documents. Please check your AnythingLLM connection and try again.",
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addManualService = () => {
    const name = prompt('Service Name:');
    const description = prompt('Service Description:');
    const category = prompt('Category:');
    const price = prompt('Price (optional):');
    
    if (name && description) {
      const service = {
        name,
        description,
        category: category || 'Other',
        price: price ? parseFloat(price) : undefined,
      };
      
      dataManager.addService(service);
      loadData();
      
      const serviceMessage = {
        sender: 'ai',
        text: `Perfect! I've added "${name}" to your knowledge base. This service is now available for analysis and SOW generation.`,
      };
      setChatMessages(prev => [...prev, serviceMessage]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Knowledge Visualization */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Repository</h2>
          <div className="flex space-x-2">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('file-upload').click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>📤</span>
              <span>Upload Documents</span>
            </button>
            <button
              onClick={addManualService}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
          {['tree', 'network', 'categories'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === viewType
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewType === 'tree' ? '🌳 Tree' : 
               viewType === 'network' ? '🕸️ Network' : '📊 Categories'}
            </button>
          ))}
        </div>

        {/* Visualization Container */}
        <div 
          ref={visualizationRef}
          className="bg-gray-50 rounded-lg min-h-[400px] flex items-center justify-center"
        />

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Uploaded Documents</h3>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {doc.type} • {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-green-500">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🤖</span>
            AI Assistant
          </h3>
          <p className="text-sm text-gray-600">Ask questions about your knowledge base</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your knowledge base..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isLoading}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <span>📤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedService.children ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    This category contains {selectedService.children.length} services:
                  </p>
                  <div className="space-y-3">
                    {selectedService.children.map((service, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        {service.price && (
                          <p className="text-sm text-green-600 font-medium mt-1">${service.price}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">{selectedService.description}</p>
                  {selectedService.price && (
                    <p className="text-lg font-semibold text-green-600">${selectedService.price}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
