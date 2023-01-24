import express from "express";
import puppeteer from "puppeteer";
// import { cors } from 'cors'

const app = express();

// app.use(cors())
app.use(express.json());
const port = 3001;

// app.use('/', import('./routes/api'))
// app.use(cors())

app.get("/user/get", async (req, res) => {
  const { username } = req.query;

  const page = await init();
  const user = await getUserStatus(page, username);

  res.status(200).send({ user: user });
});

app.get("/user/demo", async (req, res) => {
  const { username } = req.query;
  
  const page = await init();
  await requestDemo(page, username);
  const user = await getUserStatus(page, username);

  res.status(200).send({ user: user });
});

app.listen(port, () => {
  console.log(`ready on port ${port}`);
});

const init = async function () {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: null,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36");
  // await page.setViewport({ width: 1366, height: 768 });

  await doLogin(page);

//   await browser.close();

  return page;
};

const PAGES = {
  LOGIN: "http://51.222.43.170:25001/",
  TRIAL: "http://51.222.43.170:25001/user_reseller.php?trial",
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
