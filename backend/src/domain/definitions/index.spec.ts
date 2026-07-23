import { describe, expect, it } from 'vitest';
import {
  evaluateParameters,
  evaluatePrices,
  evaluateUsage,
  ParameterDefinition,
  ResourceDefinition,
  ServiceDefinition,
  validateDefinition,
  validateParameters,
  yamlToDefinition,
} from '.';

function withParameters(parameters: Partial<ParameterDefinition>[]): ServiceDefinition {
  return { parameters } as unknown as ServiceDefinition;
}

const emptyContext = { env: {}, context: {}, parameters: {} };

describe('validateParameters', () => {
  it('should reject a missing required parameter', () => {
    const definition = withParameters([{ name: 'dbName', type: 'string', required: true }]);

    expect(() => validateParameters(definition, {})).toThrow();
  });

  it('should accept a provided required parameter', () => {
    const definition = withParameters([{ name: 'dbName', type: 'string', required: true }]);

    expect(() => validateParameters(definition, { dbName: 'orders' })).not.toThrow();
  });

  it('should enforce string length and allowed values', () => {
    const definition = withParameters([
      { name: 'plan', type: 'string', required: true, minLength: 2, allowedValues: [{ value: 'small', label: 'S' }] as never },
    ]);

    expect(() => validateParameters(definition, { plan: 'small' })).not.toThrow();
    expect(() => validateParameters(definition, { plan: 'x' })).toThrow();
    expect(() => validateParameters(definition, { plan: 'large' })).toThrow();
  });

  it('should coerce and range-check numbers', () => {
    const definition = withParameters([{ name: 'cores', type: 'number', required: true, minValue: 1, maxValue: 8 }]);

    expect(() => validateParameters(definition, { cores: '4' })).not.toThrow();
    expect(() => validateParameters(definition, { cores: 'abc' })).toThrow();
    expect(() => validateParameters(definition, { cores: 20 })).toThrow();
  });

  it('should coerce boolean-like values', () => {
    const definition = withParameters([{ name: 'flag', type: 'boolean', required: true }]);

    expect(() => validateParameters(definition, { flag: 'true' })).not.toThrow();
    expect(() => validateParameters(definition, { flag: '0' })).not.toThrow();
    expect(() => validateParameters(definition, { flag: 1 })).not.toThrow();
    expect(() => validateParameters(definition, { flag: 'maybe' })).toThrow();
  });

  it('should reject a change to an immutable parameter', () => {
    const definition = withParameters([{ name: 'region', type: 'string', required: false, immutable: true }]);

    expect(() => validateParameters(definition, { region: 'us' }, { region: 'us' })).not.toThrow();
    expect(() => validateParameters(definition, { region: 'eu' }, { region: 'us' })).toThrow();
  });
});

describe('evaluateParameters', () => {
  function resource(overrides: Partial<ResourceDefinition>): ResourceDefinition {
    return { id: 'r', name: 'Resource', type: 'docker', parameters: {}, ...overrides } as unknown as ResourceDefinition;
  }

  it('should interpolate expressions and keep literals', () => {
    const result = evaluateParameters(resource({ parameters: { host: '${env.HOST}', port: '5432' } }), {
      ...emptyContext,
      env: { HOST: 'db' },
    });

    expect(result).toMatchObject({ host: 'db', port: '5432' });
  });

  it('should drop parameters that evaluate to undefined', () => {
    const result = evaluateParameters(resource({ parameters: { gone: '${env.MISSING}' } }), emptyContext);

    expect(result).not.toHaveProperty('gone');
  });

  it('should resolve mappings through the lookup table', () => {
    const result = evaluateParameters(
      resource({ parameters: {}, mappings: { plan: { value: '${env.SIZE}', map: { small: 'S', big: 'B' } } } as never }),
      { ...emptyContext, env: { SIZE: 'small' } },
    );

    expect(result.plan).toBe('S');
  });
});

describe('evaluateUsage', () => {
  it('should evaluate the usage expressions and default invalid values to zero', () => {
    const service = {
      usage: { totalCores: '${parameters.cores}', totalMemoryGB: '4', totalVolumeGB: 'abc' },
    } as unknown as ServiceDefinition;

    const usage = evaluateUsage(service, { ...emptyContext, parameters: { cores: 2 } });

    expect(usage).toEqual({ totalCores: 2, totalMemoryGB: 4, totalVolumeGB: 0 });
  });

  it('should return zeros when no usage is defined', () => {
    expect(evaluateUsage({} as ServiceDefinition, emptyContext)).toEqual({ totalCores: 0, totalMemoryGB: 0, totalVolumeGB: 0 });
  });
});

describe('evaluatePrices', () => {
  it('should count matching prices per billing identifier', () => {
    const service = {
      prices: [
        { billingIdentifier: 'cores', target: '${parameters.size}', test: 'large' },
        { billingIdentifier: 'cores', target: '${parameters.tier}', test: 'gold' },
        { billingIdentifier: 'volume', target: '${parameters.size}', test: 'small' },
      ],
    } as unknown as ServiceDefinition;

    const result = evaluatePrices(service, { ...emptyContext, parameters: { size: 'large', tier: 'gold' } });

    expect(result).toEqual({ cores: { quantity: 2 } });
  });

  it('should return nothing when there are no prices', () => {
    expect(evaluatePrices({} as ServiceDefinition, emptyContext)).toEqual({});
  });
});

describe('yamlToDefinition', () => {
  it('should parse a service definition', () => {
    const definition = yamlToDefinition(`
pricingModel: fixed
parameters: []
resources:
  - id: db
    name: Database
    type: docker
    parameters: {}
`);

    expect(definition.pricingModel).toBe('fixed');
    expect(definition.resources).toHaveLength(1);
    expect(definition.resources[0].id).toBe('db');
  });

  it('should return an empty definition for empty input', () => {
    expect(yamlToDefinition('').parameters).toBeUndefined();
  });

  it('should throw for malformed yaml', () => {
    expect(() => yamlToDefinition('[unclosed')).toThrow();
  });
});

describe('validateDefinition', () => {
  it('should resolve for a valid definition', async () => {
    const definition = yamlToDefinition(`
pricingModel: fixed
parameters:
  - name: dbName
    type: string
    required: true
resources:
  - id: db
    name: Database
    type: docker
    parameters:
      image: postgres
`);

    await expect(validateDefinition(definition)).resolves.toBeUndefined();
  });

  it('should reject when a required top-level field is missing', async () => {
    const definition = yamlToDefinition(`
parameters: []
resources: []
`);

    await expect(validateDefinition(definition)).rejects.toThrow();
  });
});
