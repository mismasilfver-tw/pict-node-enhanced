/**
 * Integration tests for statistics API endpoints
 */
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../../routes');

// Mock the pict and strings functions since we can't actually run PICT in tests
jest.mock('../../../lib/index', () => ({
  pict: jest.fn().mockResolvedValue([
    { param1: 'value1', param2: 'value1' },
    { param1: 'value1', param2: 'value2' },
    { param1: 'value2', param2: 'value1' },
    { param1: 'value2', param2: 'value2' }
  ]),
  strings: jest.fn().mockResolvedValue([
    { param1: 'value1', param2: 'value1' },
    { param1: 'value1', param2: 'value2' },
    { param1: 'value2', param2: 'value1' },
    { param1: 'value2', param2: 'value2' }
  ])
}));

// Mock the statistics functions
jest.mock('../../../lib/index', () => {
  const original = jest.requireActual('../../../lib/index');
  return {
    ...original,
    pict: jest.fn().mockResolvedValue([
      { param1: 'value1', param2: 'value1' },
      { param1: 'value1', param2: 'value2' },
      { param1: 'value2', param2: 'value1' },
      { param1: 'value2', param2: 'value2' }
    ]),
    strings: jest.fn().mockResolvedValue([
      { param1: 'value1', param2: 'value1' },
      { param1: 'value1', param2: 'value2' },
      { param1: 'value2', param2: 'value1' },
      { param1: 'value2', param2: 'value2' }
    ]),
    pict: {
      stats: jest.fn().mockResolvedValue({
        combinations: 4,
        generatedTests: 4,
        generationTime: 0.01,
        generationTimeNodeJs: 5
      })
    },
    strings: {
      stats: jest.fn().mockResolvedValue({
        combinations: 4,
        generatedTests: 4,
        generationTime: 0.01,
        generationTimeNodeJs: 5
      })
    }
  };
});

// Create a test app
const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

describe('Statistics API Integration Tests', () => {
  const testModel = [
    {
      key: 'param1',
      values: ['value1', 'value2']
    },
    {
      key: 'param2',
      values: ['value1', 'value2']
    }
  ];

  const testConstraints = [
    '[param1] = "value1" => [param2] = "value1"'
  ];

  describe('POST /api/generate endpoint', () => {
    test('should return test cases with statistics', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          model: testModel,
          options: { order: 2 }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('cases');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('statistics');
      
      // Check enhanced statistics properties
      expect(response.body.statistics).toHaveProperty('combinations');
      expect(response.body.statistics).toHaveProperty('generatedTests');
      expect(response.body.statistics).toHaveProperty('order', 2);
      expect(response.body.statistics).toHaveProperty('theoreticalMax');
      expect(response.body.statistics).toHaveProperty('coveragePercentage', 100);
      expect(response.body.statistics).toHaveProperty('efficiency');
      expect(response.body.statistics).toHaveProperty('constraintReduction');
    });

    test('should handle constraints correctly', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          model: testModel,
          constraints: testConstraints,
          options: { order: 2 }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statistics');
    });

    test('should handle invalid model format', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          model: 'invalid model',
          options: { order: 2 }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/stats endpoint', () => {
    test('should return only statistics', async () => {
      const response = await request(app)
        .post('/api/stats')
        .send({
          model: testModel,
          options: { order: 2 }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statistics');
      expect(response.body).not.toHaveProperty('cases');
      
      // Check enhanced statistics properties
      expect(response.body.statistics).toHaveProperty('combinations');
      expect(response.body.statistics).toHaveProperty('generatedTests');
      expect(response.body.statistics).toHaveProperty('order', 2);
      expect(response.body.statistics).toHaveProperty('theoreticalMax');
      expect(response.body.statistics).toHaveProperty('coveragePercentage', 100);
      expect(response.body.statistics).toHaveProperty('efficiency');
      expect(response.body.statistics).toHaveProperty('constraintReduction');
    });

    test('should handle different order values', async () => {
      const response = await request(app)
        .post('/api/stats')
        .send({
          model: testModel,
          options: { order: 3 }
        });

      expect(response.status).toBe(200);
      expect(response.body.statistics).toHaveProperty('order', 3);
    });

    test('should handle constraints correctly', async () => {
      const response = await request(app)
        .post('/api/stats')
        .send({
          model: testModel,
          constraints: testConstraints,
          options: { order: 2 }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statistics');
    });

    test('should handle invalid model format', async () => {
      const response = await request(app)
        .post('/api/stats')
        .send({
          model: 'invalid model',
          options: { order: 2 }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
