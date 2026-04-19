Cypress.Commands.add('login', () => {
  return cy.request({
    method: 'POST',
    url: '/user/login',
    headers: { 'X-Service-Id': Cypress.env('serviceId') },
    body: {
      username: Cypress.env('username'),
      password: Cypress.env('password'),
    },
  }).then((res) => {
    Cypress.env('token', res.body.token);
    Cypress.env('userId', res.body.userId);
    return res.body;
  });
});

Cypress.Commands.add('getWalletId', () => {
  const userId = Cypress.env('userId');

  return cy.request({
    method: 'GET',
    url: `/user/info/${userId}`,
    headers: { Authorization: `Bearer ${Cypress.env('token')}` },
  }).then((res) => {
    return res.body.walletId;
  });
});
