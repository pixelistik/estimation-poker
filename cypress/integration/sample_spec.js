describe('Basic single user estimation', function () {
    it('Should set the story', function () {
        cy.visit('http://localhost:5000/#LNzruZcx');
        cy.get('.story .et-hint').click();
        cy.get('.story input').type('A good user story{enter}');
        
        cy.get('.story .et-label').contains('A good user story');
    });
    
    it('Should set the user name', function () {
        cy.visit('http://localhost:5000/#LNzruZcx');
        cy.contains('Estimation Poker');
        cy.get('.username').click();
        cy.get('.username input').type('Tom Tester{enter}');
        
        cy.get('.estimation-select').contains('8').click();
        cy.get('.summary').contains('8');
    });
    
    it('Should set the estimation', function () {
        cy.visit('http://localhost:5000/#LNzruZcx');
        cy.get('.estimation-select').contains('8').click();
        cy.get('.summary').contains('8');
    });
});