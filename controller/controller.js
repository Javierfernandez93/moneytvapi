import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";

const log = (message) => console.log(`SERVER ${message}`);
const DEFAULT_PACKAGE = 2

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
  HOME: "http://51.222.43.170:25001/reseller.php",
  LOGIN: "http://51.222.43.170:25001/",
  TRIAL: "http://51.222.43.170:25001/user_reseller.php?trial",
  SERVICE: "http://51.222.43.170:25001/user_reseller.php",
  USERS: "http://51.222.43.170:25001/users.php",
  USER: "http://51.222.43.170:25001/user_reseller.php",
  REQUEST_FULL: "http://51.222.43.170:25001/user_reseller.php",
  RENOVATION: "http://51.222.43.170:25001/user_reseller.php",
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

const requestFull = async function (page, id, package_id) {
  await page.goto(`${PAGES.REQUEST_FULL}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  await clickIntoButton(page, "button.swal-button"); // go to purchase

  package_id = package_id != undefined ? package_id : DEFAULT_PACKAGE
  log(`package ${package_id}`);
  const extendPackage = "#package";
  await page.waitForSelector(extendPackage);
  await page.select("#package", String(package_id));

  await clickIntoButton(page, "a.btn-secondary"); // go to purchase
  await clickIntoButton(page, "input.purchase"); // purchase
};

/* @package_id = 2 Oficial 1 Mes Completo, 
  3 = Oficial 1 Mes Sin XXX
  4 = Official 3 Meses Sin XXX
  5 = Official 3 Meses Completo
  10 = 6 meses completo
  11 = 6 meses sin xxx
  12 = 12 meses completo
  13 = 13 meses sin xxx
*/
const requestRenovation = async function (page, id, package_id) {
  await page.goto(`${PAGES.RENOVATION}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  package_id = package_id != undefined ? package_id : DEFAULT_PACKAGE
  
  log(`package ${package_id}`);
  const extendPackage = "#package";
  await page.waitForSelector(extendPackage);
  await page.select("#package", String(package_id));

  await clickIntoButton(page, "a.btn-secondary"); // go to purchase
  await clickIntoButton(page, "input.purchase"); // purchase
};

/* @package_id = 2 Oficial 1 Mes Completo, 
  3 = Oficial 1 Mes Sin XXX
  4 = Official 3 Meses Sin XXX
  5 = Official 3 Meses Completo
  10 = 6 meses completo
  11 = 6 meses sin xxx
  12 = 12 meses completo
  13 = 13 meses sin xxx
*/
const requestService = async function (page, username, package_id) {
  await page.goto(PAGES.SERVICE, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");
  await page.type("#username", username);

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  package_id = package_id != undefined ? package_id : DEFAULT_PACKAGE
  
  log(`package ${package_id}`);
  const extendPackage = "#package";
  await page.waitForSelector(extendPackage);
  await page.select("#package", String(package_id));

  await clickIntoButton(page, "a.btn-secondary"); // go to purchase
  await clickIntoButton(page, "input.purchase"); // purchase
};


const timeout = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getUserById = async function (page, id) {
  await page.goto(`${PAGES.USER}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#username");

  const downloadType = "#download_type";
  await page.waitForSelector(downloadType);
  await page.select("#download_type", "type=m3u&output=mpegts");

  log(`getUserById ${id}`)

  await timeout(100);

  return {
    user_name: await page.$eval("#username", input => input.getAttribute("value")),
    password: await page.$eval("#password", input => input.getAttribute("value")),
    exp_date: await page.$eval("#exp_date", input => input.getAttribute("value")),
    download_url: await page.evaluate(() => document.querySelector('#download_url').value)
  }
}

const getLastMovies = async function (page, username) {
  await page.goto(PAGES.HOME, { waitUntil: "networkidle2", timeout: 0 });
  await page.waitForSelector("#cardActivity");

  const cardActivity = await page.$('div#cardActivity')

  return await cardActivity.$$eval("a", items => {
    return Array.from(items, (item) => {
      return {
          link: item.href,
          image: item.querySelector("img").src
      };
    })
  });
}

const getUserByName = async function (page, username) {
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

export { init, getUserById, requestDemo, requestService, requestRenovation, getUserByName, getLastMovies, requestFull, log };