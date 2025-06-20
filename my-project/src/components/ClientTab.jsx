'use client';

import React, { useState, useEffect } from 'react';
import { DataManager } from '@/utils/dataManager';

export default function ClientTab() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  
  useEffect(() => {
    const dataManager = new DataManager();
    // Get actual client data - currently empty until data is added
    const clientData = dataManager.getClients();
    setClients(clientData);
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? client.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleAddClient = () => {
    setShowAddClientModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        <button 
          onClick={handleAddClient}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
        >
          Add Client
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="cold">Cold</option>
          <option value="warm">Warm</option>
          <option value="hot">Hot</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Client List or Empty State */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first client.'}
          </p>
          <button 
            onClick={handleAddClient}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'client' ? 'bg-green-100 text-green-800' :
                  client.status === 'hot' ? 'bg-red-100 text-red-800' :
                  client.status === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {client.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{client.industry}</p>
              <p className="text-sm text-gray-500 mb-2">{client.contact}</p>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal - Placeholder */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <p className="text-gray-600 mb-4">Client form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
