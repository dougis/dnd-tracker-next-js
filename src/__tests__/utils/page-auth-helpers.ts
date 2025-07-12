/**
 * Page authentication test helpers to reduce duplication
 */

import { unauthenticatedScenarios } from './auth-mocks';

export function createUnauthenticatedScenarios() {
  return unauthenticatedScenarios;
}

export function createUserTestCases() {
  return [
    {
      description: 'user with only id',
      session: { user: { id: 'test-id' } },
      shouldRedirect: false,
    },
    {
      description: 'user with id and email',
      session: { user: { id: 'test-id', email: 'test@example.com' } },
      shouldRedirect: false,
    },
    {
      description: 'user with empty id',
      session: { user: { id: '' } },
      shouldRedirect: true,
    },
    {
      description: 'user without id property',
      session: { user: { email: 'test@example.com' } },
      shouldRedirect: true,
    },
  ];
}

export function createPageStructureExpectation() {
  return expect.objectContaining({
    type: 'div',
    props: expect.objectContaining({
      className: 'space-y-6',
      children: expect.arrayContaining([
        expect.objectContaining({
          type: 'div',
          props: expect.objectContaining({
            children: expect.arrayContaining([
              expect.objectContaining({
                type: 'h1',
                props: expect.objectContaining({
                  children: 'Parties',
                }),
              }),
            ]),
          }),
        }),
        expect.any(Object), // PartyListView component
      ]),
    }),
  });
}