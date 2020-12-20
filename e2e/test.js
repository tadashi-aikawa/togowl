const chromium = require("playwright").chromium;

/** @type {import('playwright').Browser} */
let browser;
/** @type {import('playwright').Page} */
let page;

// Environment variables
const { TOGOWL_MAIL_ADDRESS, TOGOWL_PASSWORD } = process.env;

beforeAll(async () => {
  browser = await chromium.launch();
});

describe("LOGIN", () => {
  beforeAll(async () => {
    page = await browser.newPage({
      viewport: { width: 480, height: 720 },
      recordVideo: { dir: "videos/" },
    });
    await page.goto("http://localhost:3000");
  });

  it("Title is valid", async () => {
    expect(await page.title()).toBe("togowl - togowl");
  });

  it("Exists login button", async () => {
    await expect(page).toHaveText("#login-button", "Login");
  });

  it("Login", async () => {
    await page.fill("#mail-address-input", TOGOWL_MAIL_ADDRESS);
    await page.fill("#password-input", TOGOWL_PASSWORD);
    await page.click("#login-button");
    await expect(page).toHaveSelector("#main-contents");
  });
});

afterAll(async () => {
  await browser.close();
});
