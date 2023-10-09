import puppeteer from "puppeteer-extra"
import chromium from "chrome-aws-lambda";
import config from '../config/config.json' assert {type: 'json'};
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const log = (message) => console.log(`SERVER ${message}`);
const DEFAULT_PACKAGE = 78

puppeteer.use(StealthPlugin()) 
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: { 
//       id: '2captcha', token: '449c39aa980d73be0a0f311ec44210a5' },
//       visualFeedback: true
//   })
// );

const init = async function () {
  const browser = await puppeteer.launch({
    headless: 'old', // default 'old', local = false
    defaultViewport: null,
    executablePath: await chromium.executablePath,
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox"
    ],
    slowMo: 5,
    // headless: false
  });

  const page = await browser.newPage();

  await doLogin(page);

  return {
    s: 1,
    browser: browser,
    page: page,
  };
};

const PAGES = {
  HOME: "http://xyz.lattv.com.co:25500/",
  LOGIN: "http://xyz.lattv.com.co:8080/Reseller/login",
  TRIAL: "http://xyz.lattv.com.co:8080/Reseller/line?trial=1",
  SERVICE: "http://xyz.lattv.com.co:8080/Reseller/line",
  USERS: "http://xyz.lattv.com.co:8080/Reseller/lines",
  USER: "http://xyz.lattv.com.co:8080/Reseller/",
  REQUEST_FULL: "http://xyz.lattv.com.co:8080/Reseller/",
  RENOVATION: "http://xyz.lattv.com.co:8080/Reseller/",
};

const doLogin = async function (page) {
  try {
    await page.goto(PAGES.LOGIN);
    
    await page.solveRecaptchas()
    
    await page.type("#username", "funnelmillonario");
    await page.type("#password", "exitoconjavi2024");
  
    await clickIntoButton(page, "#login_button"); // login

    return {
      s : 1
    }

  } catch (e) {
    return {
      s: 0,
      r: config.STATUS.ERROR_AT_LOGIN,
    };
  }
};

const requestDemo = async function (page, data) {
  try {
    console.log(data)
    await page.goto(PAGES.TRIAL, { waitUntil: "networkidle2", timeout: 0 });
    
    await page.waitForSelector("#username");
    await page.type("#username", data.username);
    
    await page.waitForSelector("#password");
    await page.type("#password", data.password);
  
    // const downloadType = "#download_type";
    // await page.select("#download_type", "type=m3u&output=mpegts");
    
    await page.select("#package", "167");
    
    await page.waitForSelector('a[href="#review-purchase"]');
    
    await clickIntoButtonByQuery(page, 'a[href="#review-purchase"]')
    await clickIntoButton(page, "input#submit_button"); 
  } catch (e) {
    return {
      s: 0,
      r: config.STATUS.ERROR_OPENING_PAGE,
    };
  }
};

const requestFull = async function (page, id, package_id) {
  try {
    await page.goto(`${PAGES.REQUEST_FULL}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });
    await page.waitForSelector("#username");

    // const downloadType = "#download_type";
    // await page.waitForSelector(downloadType);
    // await page.select("#download_type", "type=m3u&output=mpegts");

    await clickIntoButton(page, "button.swal-button"); // go to purchase

    package_id = package_id != undefined ? package_id : DEFAULT_PACKAGE
    
    log(`package ${package_id}`);

    const extendPackage = "#package";
    await page.waitForSelector(extendPackage);

    await page.select("#package", String(package_id));

    await clickIntoButtonByQuery(page, 'a[href="#review-purchase"]')
    // await clickIntoButton(page, "input.purchase"); // purchase

    return {
      s: 1
    }
  } catch (e) {
    return {
      s: 0,
      r: config.STATUS.ERROR_OPENING_PAGE,
    };
  }
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
  try {
    await page.goto(`${PAGES.RENOVATION}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });
    await page.waitForSelector("#username");

    // const downloadType = "#download_type";
    // await page.waitForSelector(downloadType);
    // await page.select("#download_type", "type=m3u&output=mpegts");

    package_id = package_id != undefined ? package_id : DEFAULT_PACKAGE
    
    log(`package ${package_id}`);
    const extendPackage = "#package";
    await page.waitForSelector(extendPackage);
    await page.select("#package", String(package_id));

    await clickIntoButtonByQuery(page, 'a[href="#review-purchase"]')
    await clickIntoButton(page, "input.purchase"); // purchase

    return {
      s: 1
    }
  } catch (e) {
    return {
      s: 0,
      r: config.STATUS.ERROR_OPENING_PAGE,
    };
  }
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
const requestService = async function (page, data) {
  try {
    await page.goto(PAGES.SERVICE, { waitUntil: "networkidle2", timeout: 0 });
    
    await page.waitForSelector("#username");
    await page.type("#username", data.username);
    
    await page.waitForSelector("#password");
    await page.type("#password", data.password);

    let package_id = data.package_id != undefined ? data.package_id : DEFAULT_PACKAGE
    
    log(`package ${package_id}`);

    const extendPackage = "#package";
    await page.waitForSelector(extendPackage);
    await page.select("#package", String(package_id));
    
    await clickIntoButtonByQuery(page, 'a[href="#review-purchase"]')
    
    await page.waitForSelector("input.purchase");
    await clickIntoButton(page, "input.purchase"); // purchase
  } catch (e) {
    return {
      s: 0,
      r: config.STATUS.ERROR_OPENING_PAGE,
    };
  }
};


const timeout = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const existUserById = async function (page, id) {
  await page.goto(`${PAGES.USER}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });

  const n = await page.$("#topnav");

  if (n != null) 
  {
    return {
      s : 1
    }
  } else {
    return {
      s : 0
    }
  }
}

const getUserById = async function (page, id) {
  try {
    const response = await page.goto(`${PAGES.USER}?id=${id}`, { waitUntil: "networkidle2", timeout: 0 });

    log(`getUserById ${id}`)

    try {
      const res = await page.waitForSelector("#username", {timeout: 1000});

      if(res)
      {
        return {
          s : 1,
          user_name: await page.$eval("#username", input => input.getAttribute("value")),
          password: await page.$eval("#password", input => input.getAttribute("value")),
          exp_date: await page.$eval("#exp_date", input => input.getAttribute("value")),
          // download_url: await page.evaluate(() => document.querySelector('#download_url').value)
        }
      } else {
        return {
          r : config.STATUS.USERNAME_NOT_FOUND,
          s : 0,
        }
      }
    } catch (e) {
      if (e instanceof TimeoutError) {
        return {
          r : config.STATUS.USERNAME_NOT_FOUND,
          s : 0,
        }
      } else {
        return {
          r : config.STATUS.USERNAME_NOT_FOUND,
          s : 0,
        }
      }
    }    
  } catch (e) {
    return {
      s : 1,
    }
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

const clickIntoButtonByQuery = async function (page, button) {
  const btn = await page.$(button);

  if(btn)
  {
    await btn.click();
  }
}

const clickIntoButtonByText = async function (page, button) {
  const [btn] = await page.$x(button);

  if(btn)
  {
    await btn.click();
  }
}

const clickIntoButton = async function (page, button) {
  await page.waitForSelector(button);
  await page.click(button);
};

export { init, getUserById, requestDemo, requestService, requestRenovation, getUserByName, getLastMovies, requestFull, existUserById, log };