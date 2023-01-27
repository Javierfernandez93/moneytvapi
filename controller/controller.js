import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";

const log = (message) => console.log(`SERVER ${message}`);

const init = async function () {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: await chromium.executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await doLogin(page);

  return {
    browser: browser,
    page: page,
  };
};

const PAGES = {
  LOGIN: "http://51.222.43.170:25001/",
  TRIAL: "http://51.222.43.170:25001/user_reseller.php?trial",
  SERVICE: "http://51.222.43.170:25001/user_reseller.php",
  USERS: "http://51.222.43.170:25001/users.php",
};

const doLogin = async function (page) {
  await page.goto(PAGES.LOGIN);
  await page.type("#username", "vetv02");
  await page.type("#password", "momento7");

  await clickIntoButton(page, "#login_button"); // login
};

const requestDemo = async function (page, username) {
  await page.goto(PAGES.TRIAL, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");
  await page.type("#username", username);

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  await clickIntoButton(page, "a.btn-secondary"); // go to purchase
  await clickIntoButton(page, "input.purchase"); // purchase
};

const requestService = async function (page, username) {
  await page.goto(PAGES.SERVICE, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");
  await page.type("#username", username);

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  await clickIntoButton(page, "a.btn-secondary"); // go to purchase
  await clickIntoButton(page, "input.purchase"); // purchase
};

const getUserStatus = async function (page, username) {
  await page.goto(PAGES.USERS, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector(".table");

  const headers = await page.$$eval("thead tr", (rows) => {
    return Array.from(rows, (row) => {
      const columns = row.querySelectorAll("th");

      return Array.from(columns, (column) => column.innerText);
    });
  });

  let results = await page.$eval("tbody", (tbody) =>
    [...tbody.rows].map((r) => [...r.cells].map((c) => c.innerText))
  );

  const keys = headers[0];
  let users = [];

  results.map((result) => {
    const merged = keys.reduce(
      (obj, key, index) => ({ ...obj, [key]: result[index] }),
      {}
    );
    users.push(merged);
  });

  if (users.length > 0) {
    return users.filter((user) => {
      return user.USERNAME.toLowerCase().includes(username.toLowerCase());
    })[0];
  }

  return {};
};

const clickIntoButton = async function (page, button) {
  await page.waitForSelector(button);
  await page.click(button);
};

export { init, getUserStatus, requestDemo, requestService, log };
