// simplified-api.js
export class DataManager {
  constructor() {
    // Simplified implementation for demonstration
    this.services = [
      {
        id: 1,
        name: 'Marketing Automation',
        category: 'Marketing',
        description: 'Set up and optimize marketing automation workflows',
        price: 5000
      },
      {
        id: 2,
        name: 'CRM Integration',
        category: 'Technology',
        description: 'Integrate CRM systems with your marketing stack',
        price: 3500
      },
      {
        id: 3,
        name: 'Content Strategy',
        category: 'Marketing',
        description: 'Develop comprehensive content strategy',
        price: 2500
      }
    ];
    
    this.clients = [
      {
        id: 1,
        name: 'Acme Corp',
        industry: 'Technology',
        status: 'client'
      },
      {
        id: 2,
        name: 'Globex Industries',
        industry: 'Manufacturing',
        status: 'hot'
      }
    ];
  }
  
  getHierarchicalData() {
    return {
      name: 'Services',
      children: [
        {
          name: 'Marketing',
          children: this.services.filter(s => s.category === 'Marketing').map(s => ({
            name: s.name,
            value: s.price,
            description: s.description,
            category: s.category
          }))
        },
        {
          name: 'Technology',
          children: this.services.filter(s => s.category === 'Technology').map(s => ({
            name: s.name,
            value: s.price,
            description: s.description,
            category: s.category
          }))
        }
      ]
    };
  }
  
  getClients() {
    return this.clients;
  }
  
  getServices() {
    return this.services;
  }
}

export default DataManager;
