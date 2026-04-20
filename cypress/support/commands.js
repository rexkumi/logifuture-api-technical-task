Cypress.Commands.add('login', () => {
  return cy
    .request({
      method: 'POST',
      url: '/user/login',
      headers: { 'X-Service-Id': Cypress.env('serviceId') },
      body: {
        username: Cypress.env('username'),
        password: Cypress.env('password'),
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('userId');

      Cypress.env('token', response.body.token);
      Cypress.env('userId', response.body.userId);
      return response.body;
    });
});

Cypress.Commands.add('getWalletId', () => {
  const userId = Cypress.env('userId');
  
  expect(userId, 'userId must be set before calling getWalletId').to.exist;

  return cy
    .request({
      method: 'GET',
      url: `/user/info/${userId}`,
      headers: { Authorization: `Bearer ${Cypress.env('token')}` },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('walletId');
      return response.body.walletId;
    });
});
