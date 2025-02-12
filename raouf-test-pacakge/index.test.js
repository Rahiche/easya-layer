const { greet } = require('./index');

test('greet function returns correct greeting', () => {
    expect(greet('John')).toBe('Hello, John!');
});