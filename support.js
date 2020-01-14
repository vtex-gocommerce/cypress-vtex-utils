'use strict';

before(() => {
  cy.task('removeConsole');
  cy.task('removeHar');
  cy.task('recordHarConsole');

});

after(() => {
  cy.task('saveHar');
  cy.task('saveConsole');
});