'use client';

import React, { useState, useEffect } from 'react';
import { dataManager } from '@/utils/enhanced-data-manager';

export default function EnhancedClientTab() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    location: '',
    status: 'cold',
    dealValue: '',
    notes: '',
    linkedinUrl: '',
    websiteUrl: '',
  });

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScrapingLinkedIn, setIsScrapingLinkedIn] = useState(false);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const clientData = dataManager.getClients();
    setClients(clientData);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newClient = await dataManager.addClient(formData);
      setClients([...clients, newClient]);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        location: '',
        status: 'cold',
        dealValue: '',
        notes: '',
        linkedinUrl: '',
        websiteUrl: '',
      });
      showNotification('Client added successfully!', 'success');
    } catch (error) {
      console.error('Error adding client:', error);
      showNotification('Failed to add client', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAutofill = async () => {
    if (!formData.linkedinUrl && !formData.websiteUrl) {
      showNotification('Please provide LinkedIn URL or Website URL for AI autofill', 'warning');
      return;
    }

    try {
      // LinkedIn scraping
      if (formData.linkedinUrl) {
        setIsScrapingLinkedIn(true);
        const linkedinData = await dataManager.scrapeLinkedInProfile(formData.linkedinUrl);
        
        if (linkedinData) {
          setFormData(prev => ({
            ...prev,
            name: linkedinData.name || prev.name,
            location: linkedinData.location || prev.location,
            company: linkedinData.company || prev.company,
          }));
          showNotification('LinkedIn data extracted successfully!', 'success');
        }
      }

      // Website scraping
      if (formData.websiteUrl) {
        setIsScrapingWebsite(true);
        const websiteData = await dataManager.scrapeWebsite(formData.websiteUrl);
        
        if (websiteData) {
          setFormData(prev => ({
            ...prev,
            company: websiteData.name || prev.company,
            industry: websiteData.industry || prev.industry,
            notes: websiteData.overview || prev.notes,
          }));
          showNotification('Website data extracted successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('AI autofill error:', error);
      showNotification('AI autofill failed. Please try again.', 'error');
    } finally {
      setIsScrapingLinkedIn(false);
      setIsScrapingWebsite(false);
    }
  };

  const handleAnalyzeClient = async (clientId) => {
    setIsAnalyzing(true);
    try {
      const analysis = await dataManager.analyzeClient(clientId);
      if (analysis) {
        loadClients(); // Refresh to show updated insights
        showNotification('Client analysis completed!', 'success');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      showNotification('Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await dataManager.deleteClient(clientId);
        setClients(clients.filter(c => c.id !== clientId));
        setSelectedClient(null);
        showNotification('Client deleted successfully', 'success');
      } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete client', 'error');
      }
    }
  };

  const handleDocumentUpload = async (clientId, file) => {
    try {
      const result = await dataManager.uploadClientDocument(clientId, file);
      if (result) {
        loadClients(); // Refresh to show new document
        showNotification('Document uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Document upload failed', 'error');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const showNotification = (message, type) => {
    // Simple notification - you can enhance this with a proper toast library
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message); // Temporary - replace with proper toast
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage your clients with AI-powered insights</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Client</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="cold">Cold</option>
          <option value="warm">Warm</option>
          <option value="hot">Hot</option>
        </select>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h3>
          <p className="text-gray-600 mb-4">
            {clients.length === 0 
              ? "Start by adding your first client"
              : "No clients match your current filters"
            }
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add Your First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`p-6 border-l-4 ${
                client.status === 'hot' ? 'border-green-500' :
                client.status === 'warm' ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-gray-600">{client.company}</p>
                    <p className="text-sm text-gray-500">{client.industry}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'hot' ? 'bg-green-100 text-green-800' :
                    client.status === 'warm' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">📧 {client.email}</p>
                  <p className="text-sm text-gray-600">📱 {client.phone}</p>
                  <p className="text-sm text-gray-600">📍 {client.location}</p>
                  {client.dealValue && (
                    <p className="text-sm text-gray-600">💰 ${client.dealValue}</p>
                  )}
                </div>

                {client.documents && client.documents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">📄 {client.documents.length} document(s)</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAnalyzeClient(client.id)}
                    disabled={isAnalyzing}
                    className="bg-primary text-white px-3 py-2 rounded text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? '🔄' : '🤖'} AI
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* AI Autofill Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">🤖 AI-Powered Autofill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website URL
                    </label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="https://company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAIAutofill}
                  disabled={isScrapingLinkedIn || isScrapingWebsite || (!formData.linkedinUrl && !formData.websiteUrl)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {(isScrapingLinkedIn || isScrapingWebsite) ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      <span>Extracting Data...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>AI Autofill</span>
                    </>
                  )}
                </button>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="cold">Cold</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Value ($)
                  </label>
                  <input
                    type="number"
                    name="dealValue"
                    value={formData.dealValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Client</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {selectedClient.email}</p>
                    <p><strong>Phone:</strong> {selectedClient.phone}</p>
                    <p><strong>Company:</strong> {selectedClient.company}</p>
                    <p><strong>Industry:</strong> {selectedClient.industry}</p>
                    <p><strong>Location:</strong> {selectedClient.location}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedClient.status === 'hot' ? 'bg-green-100 text-green-800' :
                        selectedClient.status === 'warm' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedClient.status}
                      </span>
                    </p>
                    {selectedClient.dealValue && (
                      <p><strong>Deal Value:</strong> ${selectedClient.dealValue}</p>
                    )}
                    <p><strong>Created:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                    {selectedClient.lastAnalyzed && (
                      <p><strong>Last Analyzed:</strong> {new Date(selectedClient.lastAnalyzed).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedClient.notes}</p>
                </div>
              )}

              {selectedClient.documents && selectedClient.documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedClient.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.aiInsights && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Insights</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                      __html: selectedClient.aiInsights.replace(/\n/g, '<br>') 
                    }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Client
                </button>
                <div className="space-x-2">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleDocumentUpload(selectedClient.id, e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="document-upload"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer inline-block"
                  >
                    Upload Document
                  </label>
                  <button
                    onClick={() => handleAnalyzeClient(selectedClient.id)}
                    disabled={isAnalyzing}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
