import { describe, expect, it } from 'vitest';
import z from 'zod';

import type { ActionHandler } from '../__defs__';
import { Module } from '../module';
import { A, G, makeModule } from '../utils';

describe('New Module Test', () => {
  const group = G({
    first: A('test.first')
      .input(
        z.object({
          id: z.string(),
        })
      )
      .output(
        z.object({
          id: z.string(),
          message: z.string(),
        })
      ),
    second: A('test.second')
      .input(z.object({ name: z.string() }))
      .output(z.object({ result: z.string() })),
    third: A('test.third')
      .input(z.object({ count: z.number() }))
      .output(z.object({ total: z.number() })),
    fourth: A('test.fourth')
      .input(z.object({ active: z.boolean() }))
      .output(z.object({ status: z.string() })),
    fifth: A('test.fifth')
      .input(z.object({ data: z.array(z.string()) }))
      .output(z.object({ processed: z.number() })),
    sixth: A('test.sixth')
      .input(z.object({ email: z.string().email() }))
      .output(z.object({ valid: z.boolean() })),
    seventh: A('test.seventh')
      .input(z.object({ price: z.number().positive() }))
      .output(z.object({ formatted: z.string() })),
    eighth: A('test.eighth')
      .input(z.object({ tags: z.record(z.string()) }))
      .output(z.object({ count: z.number() })),
    ninth: A('test.ninth')
      .input(z.object({ date: z.string().datetime() }))
      .output(z.object({ timestamp: z.number() })),
    tenth: A('test.tenth')
      .input(
        z.object({
          config: z.object({ enabled: z.boolean() }),
        })
      )
      .output(z.object({ applied: z.boolean() })),
  });

  const module = makeModule('Test', group);

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have the correct actions set on creation', () => {
    const expectedResult = new Map();

    expectedResult.set('test.first', { def: group.first });
    expectedResult.set('test.second', {
      def: group.second,
    });
    expectedResult.set('test.third', { def: group.third });
    expectedResult.set('test.fourth', {
      def: group.fourth,
    });
    expectedResult.set('test.fifth', { def: group.fifth });
    expectedResult.set('test.sixth', { def: group.sixth });
    expectedResult.set('test.seventh', {
      def: group.seventh,
    });
    expectedResult.set('test.eighth', {
      def: group.eighth,
    });
    expectedResult.set('test.ninth', { def: group.ninth });
    expectedResult.set('test.tenth', { def: group.tenth });

    expect(module._actions).toEqual(expectedResult);
  });

  it('should add a single handler to the action def when registerHandlers is called', () => {
    const singleActionGroup = G({
      first: A('test.single.first')
        .input(z.object({ id: z.string() }))
        .output(
          z.object({ id: z.string(), message: z.string() })
        ),
    });

    const singleModule = makeModule(
      'SingleTest',
      singleActionGroup
    );

    const handler: ActionHandler<
      typeof singleActionGroup.first
    > = async ({ input: _input }) => {
      return {
        context: {},
        data: {
          id: '',
          message: '',
        },
      };
    };

    singleModule.registerHandlers({
      first: handler,
    });

    const expectedResult = new Map();

    expectedResult.set('test.single.first', {
      def: singleActionGroup.first,
      handler,
    });

    expect(singleModule._actions).toEqual(expectedResult);
  });

  it('should return the handler function on getHandler', () => {
    const getHandlerGroup = G({
      first: A('test.gethandler.first')
        .input(z.object({ id: z.string() }))
        .output(
          z.object({ id: z.string(), message: z.string() })
        ),
    });

    const getHandlerModule = new Module(
      'GetHandlerTest',
      getHandlerGroup
    );

    const handler: ActionHandler<
      typeof getHandlerGroup.first
    > = async ({ input: _input }) => {
      return {
        context: {},
        data: {
          id: '',
          message: '',
        },
      };
    };

    getHandlerModule.registerHandlers({
      first: handler,
    });

    expect(
      getHandlerModule.getHandler(getHandlerGroup.first)
    ).toBe(handler);
  });

  it('should add a multiple hanlders to the action def when registerHanlders is called', () => {
    const moduleTwo = new Module('Test', group);

    const firstHandler: ActionHandler<
      typeof group.first
    > = async ({ context }) => {
      return { data: { id: '', message: '' }, context };
    };

    const secondHandler: ActionHandler<
      typeof group.second
    > = async ({ context }) => {
      return { data: { result: '' }, context };
    };

    const thirdHandler: ActionHandler<
      typeof group.third
    > = async ({ context }) => {
      return { data: { total: 0 }, context };
    };

    const fourthHandler: ActionHandler<
      typeof group.fourth
    > = async ({ context }) => {
      return { data: { status: '' }, context };
    };

    const fifthHandler: ActionHandler<
      typeof group.fifth
    > = async ({ context }) => {
      return { data: { processed: 0 }, context };
    };

    const sixthHandler: ActionHandler<
      typeof group.sixth
    > = async ({ context }) => {
      return { data: { valid: true }, context };
    };

    const seventhHandler: ActionHandler<
      typeof group.seventh
    > = async ({ context }) => {
      return { data: { formatted: '' }, context };
    };

    const eighthHandler: ActionHandler<
      typeof group.eighth
    > = async ({ context }) => {
      return { data: { count: 0 }, context };
    };

    const ninthHandler: ActionHandler<
      typeof group.ninth
    > = async ({ context }) => {
      return { data: { timestamp: 0 }, context };
    };

    const tenthHandler: ActionHandler<
      typeof group.tenth
    > = async ({ context }) => {
      return { data: { applied: true }, context };
    };

    moduleTwo.registerHandlers({
      first: firstHandler,
      second: secondHandler,
      third: thirdHandler,
      fourth: fourthHandler,
      fifth: fifthHandler,
      sixth: sixthHandler,
      seventh: seventhHandler,
      eighth: eighthHandler,
      ninth: ninthHandler,
      tenth: tenthHandler,
    });

    const expectedResult = new Map();

    expectedResult.set('first', {
      def: group.first,
      handler: firstHandler,
    });
    expectedResult.set('second', {
      def: group.second,
      handler: secondHandler,
    });
    expectedResult.set('third', {
      def: group.third,
      handler: thirdHandler,
    });
    expectedResult.set('fourth', {
      def: group.fourth,
      handler: fourthHandler,
    });
    expectedResult.set('fifth', {
      def: group.fifth,
      handler: fifthHandler,
    });
    expectedResult.set('sixth', {
      def: group.sixth,
      handler: sixthHandler,
    });
    expectedResult.set('seventh', {
      def: group.seventh,
      handler: seventhHandler,
    });
    expectedResult.set('eighth', {
      def: group.eighth,
      handler: eighthHandler,
    });
    expectedResult.set('ninth', {
      def: group.ninth,
      handler: ninthHandler,
    });
    expectedResult.set('tenth', {
      def: group.tenth,
      handler: tenthHandler,
    });

    expect(moduleTwo._actions).toEqual(expectedResult);
  });
});
