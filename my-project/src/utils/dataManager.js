// DataManager for unified data access
export class DataManager {
  constructor() {
    this.serviceData = [];
    this.clientData = [];
  }

  getHierarchicalData() {
    // Return empty structure for the Knowledge tab
    return {
      name: 'Services',
      children: []
    };
  }

  getClients() {
    return [];
  }

  getServices() {
    return [];
  }

  // Method to add new service data
  addService(service) {
    this.serviceData.push(service);
  }

  // Method to add new client data
  addClient(client) {
    this.clientData.push(client);
  }

  // Method to get all data
  getAllData() {
    return {
      services: this.serviceData,
      clients: this.clientData
    };
  }
}
