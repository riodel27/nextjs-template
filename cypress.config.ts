import axios from 'axios';
import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    apiUrl: 'http://localhost:3000',
  },
  e2e: {
    setupNodeEvents(on, config) {
      const testDataApiEndpoint = `${config.env.apiUrl}`;
      on('task', {
        async createTestUser(queryPayload) {
          const response = await axios.post(
            `${testDataApiEndpoint}/api/register`,
            {
              name: queryPayload.name,
              email: queryPayload.email,
              password: queryPayload.password,
            }
          );

          return response.data;
        },
        async upsertTestUser(queryPayload) {
          const response = await axios.put(
            `${testDataApiEndpoint}/api/test/user/${encodeURIComponent(
              queryPayload.email
            )}`,
            {
              name: queryPayload.name,
              email: queryPayload.email,
              password: queryPayload.password,
              failedLoginAttempts: queryPayload.failedLoginAttempts,
            }
          );

          return response.data;
        },
        async deleteTestUser(queryPayload) {
          const response = await axios.delete(
            `${testDataApiEndpoint}/api/test/user/${encodeURIComponent(
              queryPayload.email
            )}/`
          );

          return response.data;
        },
        async getTestUser(querypayload) {
          const response = await axios.get(
            `${testDataApiEndpoint}/api/test/user/${encodeURIComponent(
              querypayload.email
            )}/`
          );

          return response.data.user;
        },
      });
    },
    baseUrl: 'http://localhost:3000',
  },
});
