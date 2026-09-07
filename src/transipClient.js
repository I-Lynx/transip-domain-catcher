const axios = require('axios');
require('dotenv').config();
const tokenManager = require('./auth/tokenManager');

/**
 * TransIP REST API Client Implementation (API v6)
 *
 * Handles authentication and domain-related API operations.
 */
class TransIPClient {
  constructor() {
    this.baseURL = 'https://api.transip.nl/v6';
    this.token = null;
  }

  /**
   * Authenticate with the TransIP API.
   *
   * @returns {Promise<string>} Valid authentication token
   * @throws {Error} When authentication fails
   */
  async authenticate() {
    try {
      this.token = await tokenManager.getToken();

      await axios.get(`${this.baseURL}/api-test`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return this.token;
    } catch (error) {
      console.error('🔒 Authentication failed:', error.message);

      if (error.response) {
        console.error(
          'API response status:',
          error.response.status
        );
      }

      throw error;
    }
  }

  /**
   * Return an authenticated Axios client.
   *
   * @returns {Promise<AxiosInstance>}
   */
  async getAuthenticatedClient() {
    if (!this.token) {
      await this.authenticate();
    }

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check domain availability.
   *
   * The TransIP availability endpoint can return possible actions.
   * For a domain catcher, we specifically need the "register" action.
   *
   * @param {string} domainName - Fully qualified domain name
   * @returns {Promise<Object>} Availability result
   */
  async checkDomainAvailability(domainName) {
    try {
      const client = await this.getAuthenticatedClient();

      console.log(`🔍 Checking if ${domainName} is available...`);

      const response = await client.get(
        `/domain-availability/${encodeURIComponent(domainName)}`
      );

      const data = response.data;

      // Prefer the explicit actions list.
      // This tells us what operation TransIP actually allows.
      const actions =
        data?.availability?.actions ||
        data?.actions ||
        [];

      if (
        Array.isArray(actions) &&
        actions.includes('register')
      ) {
        return {
          status: 'free',
          action: 'register',
          data
        };
      }

      // Compatibility with older response formats.
      if (
        data?.availability?.status === 'free' ||
        data?.status === 'free'
      ) {
        return {
          status: 'free',
          action: 'register',
          data
        };
      }

      return {
        status: 'unavailable',
        action: 'none',
        data
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.response?.data) {
        errorMessage =
          typeof error.response.data === 'object'
            ? JSON.stringify(error.response.data)
            : error.response.data;
      }

      console.error(
        `⚠️ Failed to check availability for ${domainName}: ${errorMessage}`
      );

      return {
        status: 'unavailable',
        action: 'none',
        error: errorMessage
      };
    }
  }

  /**
   * Register a new domain through TransIP.
   *
   * This is a NEW REGISTRATION, not a domain transfer.
   *
   * @param {string} domainName - Fully qualified domain name
   * @returns {Promise<Object>} Registration result
   */
  async registerDomain(domainName) {
    try {
      console.log(`📝 Starting registration for ${domainName}...`);

      const availability =
        await this.checkDomainAvailability(domainName);

      if (
        availability.status !== 'free' ||
        availability.action !== 'register'
      ) {
        return {
          success: false,
          message: `Domain ${domainName} is not available for registration`
        };
      }

      const client = await this.getAuthenticatedClient();

      // New domain registration.
      // Do NOT send authCode or transfer-related fields.
      const registrationPayload = {
        domainName: domainName
      };

      console.log(
        `🚀 Registering ${domainName} through TransIP...`
      );

      const response = await client.post(
        '/domains',
        registrationPayload
      );

      console.log(
        `🎉 Successfully registered ${domainName}!`
      );

      return {
        success: true,
        message: `Domain ${domainName} registered successfully!`,
        data: response.data
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.response?.data) {
        errorMessage =
          typeof error.response.data === 'object'
            ? JSON.stringify(error.response.data)
            : error.response.data;
      }

      console.error(
        `❌ Failed to register ${domainName}: ${errorMessage}`
      );

      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

module.exports = new TransIPClient();
