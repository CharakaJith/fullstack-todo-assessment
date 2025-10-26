const request = require('supertest');

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  async setAuthToken(token) {
    this.token = token;
  }

  async request() {
    const req = request(this.baseURL);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  async get(endpoint) {
    return (await this.request()).get(endpoint);
  }

  async post(endpoint, data) {
    return (await this.request()).post(endpoint).send(data);
  }

  async put(endpoint, data) {
    return (await this.request()).put(endpoint).send(data);
  }

  async delete(endpoint) {
    return (await this.request()).delete(endpoint);
  }
}

module.exports = ApiClient;
