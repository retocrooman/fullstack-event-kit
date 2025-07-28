// Custom commands are loaded via support/e2e.ts

describe('Basic Test (No Server Required)', () => {
  it('should verify basic Cypress functionality', () => {
    // Test basic assertion without external network call
    const testData = { name: 'Test', value: 42 };
    expect(testData.name).to.equal('Test');
    expect(testData.value).to.be.greaterThan(40);
  });

  it('should verify TypeScript is working', () => {
    const testNumber: number = 42;
    const testString: string = 'Hello TypeScript';
    
    expect(testNumber).to.equal(42);
    expect(testString).to.include('TypeScript');
  });
});