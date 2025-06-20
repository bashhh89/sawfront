'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataManager } from '@/utils/dataManager';
import { AnythingLLMService } from '@/utils/anythingllm';

export default function KnowledgeTab() {
  const [view, setView] = useState('tree');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI assistant powered by AnythingLLM. I can help you analyze your knowledge base, answer questions about your services, and provide strategic insights! 🚀",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [serviceData, setServiceData] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const visualizationRef = useRef(null);
  const anythingLLM = useRef(new AnythingLLMService());

  // Enhanced Knowledge Base Data from kb.md
  const knowledgeBaseData = {
    name: 'Social Garden Services',
    children: [
      {
        name: 'Marketing Automation',
        category: 'marketing',
        children: [
          {
            name: 'Email Template Services',
            price: 9350,
            hours: 70,
            rate: 133.57,
            description: 'Email template design, development & deployment',
            phases: ['Discovery & Planning', 'Technical Assessment & Setup', 'Quality Assurance & Testing', 'Final Delivery & Go-live'],
            deliverables: ['1x Email Template Design, Development & Deployment', 'Email Template Wireframe Design', 'UX Design: Modular prototype in Figma', 'Email Template Development', 'Email Template Testing & Rendering']
          },
          {
            name: 'MA Project Services',
            price: 9587,
            hours: 70,
            rate: 136.96,
            description: 'Complete marketing automation setup with email & SMS build',
            phases: ['Discovery & Planning', 'Technical Set Up / Assessment', 'Quality Assurance & Testing', 'Final Delivery'],
            deliverables: ['MAP automation', 'Email & SMS build', 'Landing Page Production', 'Campaign Build', 'Copywriting']
          }
        ]
      },
      {
        name: 'Account & Project Management',
        category: 'management',
        children: [
          {
            name: 'Account Management Services',
            price: 4650,
            hours: 25,
            rate: 180,
            description: 'Comprehensive account and project management for project duration',
            deliverables: ['Kick-Off Meeting', 'Work In Progress Meetings', 'Status Updates', 'Change Management Discussions', 'Internal Briefings', 'Project Plan', 'Quality Assurance and Testing Plan']
          }
        ]
      },
      {
        name: 'Technical Services',
        category: 'technical',
        children: [
          {
            name: 'Email Production',
            rate: 120,
            description: 'Email template production and development'
          },
          {
            name: 'Landing Page Production',
            rate: 120,
            description: 'Landing page design and development'
          },
          {
            name: 'Campaign Build',
            rate: 120,
            description: 'Marketing campaign setup and configuration'
          },
          {
            name: 'Senior Project Management',
            rate: 365,
            description: 'Senior-level project management and coordination'
          }
        ]
      }
    ]
  };

  useEffect(() => {
    const initializeService = async () => {
      try {
        const connected = await anythingLLM.current.verifyAuth();
        setIsConnected(connected);
        setServiceData(knowledgeBaseData);
      } catch (error) {
        console.error('Failed to connect to AnythingLLM:', error);
        setIsConnected(false);
        setServiceData(knowledgeBaseData);
      }
    };

    initializeService();
  }, []);  useEffect(() => {
    if (serviceData && visualizationRef.current) {
      renderVisualization();
    }
  }, [view, serviceData]);

  const renderVisualization = () => {
    if (!visualizationRef.current || !serviceData) return;

    const container = visualizationRef.current;
    container.innerHTML = '';

    if (serviceData.children && serviceData.children.length > 0) {
      if (view === 'tree') {
        renderTreeView(container);
      } else if (view === 'network') {
        renderNetworkView(container);
      } else if (view === 'categories') {
        renderCategoryView(container);
      }
    } else {
      // Show empty state
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-400">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-xl mb-2">No Knowledge Data</p>
          <p class="text-sm">Add services and data to see visualizations</p>
        </div>
      `;
    }
  };

  const renderTreeView = (container) => {
    const treeDiv = document.createElement('div');
    treeDiv.className = 'space-y-4';
    
    const renderNode = (node, depth = 0) => {
      const nodeDiv = document.createElement('div');
      nodeDiv.className = `ml-${depth * 4} p-4 bg-white rounded-lg shadow-sm border-l-4 border-primary cursor-pointer hover:shadow-md transition-shadow`;
      
      const priceInfo = node.price ? `<span class="text-green-600 font-semibold">$${node.price.toLocaleString()}</span>` : '';
      const rateInfo = node.rate ? `<span class="text-blue-600">$${node.rate}/hr</span>` : '';
      
      nodeDiv.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-medium text-gray-900">${node.name}</h4>
            ${node.description ? `<p class="text-sm text-gray-600 mt-1">${node.description}</p>` : ''}
            ${node.hours ? `<p class="text-xs text-gray-500 mt-1">${node.hours} hours estimated</p>` : ''}
          </div>
          <div class="text-right">
            ${priceInfo}
            ${rateInfo && priceInfo ? '<br>' : ''}
            ${rateInfo}
          </div>
        </div>
      `;
      
      nodeDiv.addEventListener('click', () => setSelectedService(node));
      treeDiv.appendChild(nodeDiv);
      
      if (node.children) {
        node.children.forEach(child => renderNode(child, depth + 1));
      }
    };

    if (serviceData.children) {
      serviceData.children.forEach(child => renderNode(child));
    }
    
    container.appendChild(treeDiv);
  };

  const renderNetworkView = (container) => {
    const networkDiv = document.createElement('div');
    networkDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    const flattenServices = (node, result = []) => {
      if (node.price || node.rate) {
        result.push(node);
      }
      if (node.children) {
        node.children.forEach(child => flattenServices(child, result));
      }
      return result;
    };
    
    const services = flattenServices(serviceData);
    
    services.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer';
      
      const categoryColor = {
        marketing: 'bg-blue-100 text-blue-800',
        management: 'bg-green-100 text-green-800',
        technical: 'bg-purple-100 text-purple-800'
      };
      
      serviceCard.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium text-gray-900">${service.name}</h4>
          <span class="px-2 py-1 rounded-full text-xs ${categoryColor[service.category] || 'bg-gray-100 text-gray-800'}">
            ${service.category || 'Service'}
          </span>
        </div>
        <p class="text-sm text-gray-600 mb-2">${service.description || ''}</p>
        <div class="flex justify-between text-sm">
          ${service.price ? `<span class="text-green-600 font-semibold">$${service.price.toLocaleString()}</span>` : ''}
          ${service.rate ? `<span class="text-blue-600">$${service.rate}/hr</span>` : ''}
        </div>
      `;
      
      serviceCard.addEventListener('click', () => setSelectedService(service));
      networkDiv.appendChild(serviceCard);
    });
    
    container.appendChild(networkDiv);
  };

  const renderCategoryView = (container) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'space-y-6';
    
    const categories = {
      'Marketing Automation': { color: 'border-blue-500', bgColor: 'bg-blue-50' },
      'Account & Project Management': { color: 'border-green-500', bgColor: 'bg-green-50' },
      'Technical Services': { color: 'border-purple-500', bgColor: 'bg-purple-50' }
    };
    
    if (serviceData.children) {
      serviceData.children.forEach(category => {
        const categorySection = document.createElement('div');
        const categoryInfo = categories[category.name] || { color: 'border-gray-500', bgColor: 'bg-gray-50' };
        
        categorySection.className = `border-l-4 ${categoryInfo.color} ${categoryInfo.bgColor} p-4 rounded-r-lg`;
        
        let totalValue = 0;
        let totalHours = 0;
        
        if (category.children) {
          category.children.forEach(service => {
            if (service.price) totalValue += service.price;
            if (service.hours) totalHours += service.hours;
          });
        }
        
        categorySection.innerHTML = `
          <h3 class="text-lg font-semibold text-gray-900 mb-2">${category.name}</h3>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-sm">
              <span class="text-gray-600">Total Value:</span>
              <span class="font-semibold text-green-600 ml-2">$${totalValue.toLocaleString()}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">Total Hours:</span>
              <span class="font-semibold text-blue-600 ml-2">${totalHours}hrs</span>
            </div>
          </div>
          <div class="space-y-2">
            ${category.children ? category.children.map(service => `
              <div class="bg-white p-3 rounded border cursor-pointer hover:shadow-sm transition-shadow">
                <div class="flex justify-between">
                  <span class="font-medium">${service.name}</span>
                  ${service.price ? `<span class="text-green-600">$${service.price.toLocaleString()}</span>` : ''}
                </div>
                ${service.description ? `<p class="text-xs text-gray-600 mt-1">${service.description}</p>` : ''}
              </div>
            `).join('') : ''}
          </div>
        `;
        
        categoryDiv.appendChild(categorySection);
      });
    }
    
    container.appendChild(categoryDiv);
  };
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMessages);
    const currentInput = chatInput;
    setChatInput('');
    setIsLoading(true);

    try {
      let response;
      if (isConnected) {
        // Use real AnythingLLM API with service context
        const contextPrompt = `${currentInput}

Context: I have access to Social Garden's service catalog including:
- Marketing Automation services ($9,350-$9,587, 70 hours)
- Account & Project Management ($4,650, 25 hours)  
- Technical Services (rates: $120-$365/hour)

Please provide helpful insights about these services, pricing, or recommendations.`;
        
        response = await anythingLLM.current.chat(contextPrompt);
      } else {
        // Intelligent fallback based on input
        if (currentInput.toLowerCase().includes('price') || currentInput.toLowerCase().includes('cost')) {
          response = "Based on our service catalog: Marketing Automation services range from $9,350-$9,587 (70 hours), Account Management is $4,650 (25 hours), and Technical Services are $120-$365/hour. What specific service are you interested in?";
        } else if (currentInput.toLowerCase().includes('service')) {
          response = "We offer three main categories: Marketing Automation (email templates, campaign setup), Account & Project Management (kick-off, status updates, project coordination), and Technical Services (email production, landing pages, campaign builds). Which would you like to know more about?";
        } else {
          response = "I can help you with information about our services, pricing, and recommendations. Try asking about specific services, pricing, or project planning!";
        }
      }

      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I apologize, but I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
    setTimeout(() => {
      setChatMessages([
        ...newMessages,
        { sender: 'ai', text: `You asked: "${chatInput}". I am still under development.` },
      ]);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    setChatInput(question);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Visual Knowledge Map */}
      <div className="lg:col-span-2">
        <div className="glass-effect rounded-xl shadow-lg card-elevated p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center mr-3">
                🗺️
              </span>
              Service Map
            </h2>
            <div className="flex space-x-2">
              <button onClick={() => setView('tree')} className={view === 'tree' ? 'btn-primary' : 'btn-secondary' + ' px-4 py-2 rounded-lg text-sm font-medium'}>🌳 Tree View</button>
              <button onClick={() => setView('network')} className={view === 'network' ? 'btn-primary' : 'btn-secondary' + ' px-4 py-2 rounded-lg text-sm font-medium'}>🕸️ Network View</button>
              <button onClick={() => setView('categories')} className={view === 'categories' ? 'btn-primary' : 'btn-secondary' + ' px-4 py-2 rounded-lg text-sm font-medium'}>📂 Categories</button>
            </div>
          </div>
          <div ref={visualizationRef} className="w-full h-96 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white"></div>
          
          {/* Service Details Panel */}
          {selectedService && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">{selectedService.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Category:</strong> {selectedService.category}</p>
                <p><strong>Description:</strong> {selectedService.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Interface */}
      <div className="lg:col-span-1">
        <div className="glass-effect rounded-xl shadow-lg card-elevated p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center mr-3">
              🤖
            </span>
            AI Assistant
          </h2>                        
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto mb-6 space-y-3 p-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`${msg.sender === 'user' ? 'user-message' : 'ai-message'} chat-message`}>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about services, pricing, improvements..."
              className="form-input flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
            <button 
              onClick={handleSendMessage}
              className="btn-primary px-6 py-3 rounded-xl hover:scale-105 transition-transform font-medium"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">📤</span>
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-3 font-medium">💡 Quick questions:</p>
            <div className="space-y-2">
              <button onClick={() => handleQuickQuestion("What's the average pricing for Marketing Automation services?")} className="quick-question w-full text-left text-xs p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 hover:border-gray-300">
                What's the average pricing for Marketing Automation services?
              </button>
              <button onClick={() => handleQuickQuestion("How can AI enhance our current service offerings?")} className="quick-question w-full text-left text-xs p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 hover:border-gray-300">
                How can AI enhance our current service offerings?
              </button>
              <button onClick={() => handleQuickQuestion("What services work best together for enterprise clients?")} className="quick-question w-full text-left text-xs p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 hover:border-gray-300">
                What services work best together for enterprise clients?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
