import 'cypress-file-upload';

describe('Import GTM container', () => {
    it('Opens a GTM container JSON file', () => {
        cy.visit('http://localhost:8080');

        const fileName = "GTM-sample.json";

        cy.fixture(fileName).then(fileContent => {
            cy.get('header .v-file-input input').upload({ fileContent, fileName, mimeType: 'application/json', encoding: 'utf8' });
        });
    })
});