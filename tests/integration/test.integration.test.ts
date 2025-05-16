import { setupTestDB } from "../fixtures/setupTestDB"; '../fixtures/setupTestDB';



describe('Weekday Integration Test', () => {

  setupTestDB();

  it('should test', async () => {
    const test = 1+1

    expect(test).not.toBeNull();
    expect(test).toBe(2);
  });

});