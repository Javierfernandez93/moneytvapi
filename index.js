import express from "express";
import { init, requestDemo, requestService, getUserStatus, log } from "./controller/controller.js";
import cors from 'cors'

const app = express();

app.use(cors())
// app.use('/', import('./routes/api'))
// app.use(cors())

app.use(express.json());

const port = 3000;

app.get("/", async (req, res) => {
  res.status(200).send({s:1,r:'all_services_working'})
})

app.get("/user/get", async (req, res) => {
  const { username } = req.query;

  if(username)
  {
    log('gettinguser')
    
    const client = await init()
    const user = await getUserStatus(client.page, username);
    
    await client.browser.close();
    
    log('done')

    res.status(200).send({ user: user });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
});

app.get("/user/service", async (req, res) => {
  const { username } = req.query;
  
  if(username)
  {
    console.log('settingup service')

    const client = await init();
    await requestService(client.page, username);
    const user = await getUserStatus(client.page, username);
  
    await client.browser.close();

    res.status(200).send({ 
      s: 1,
      user: user 
    });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
})

app.get("/user/demo", async (req, res) => {
  const { username } = req.query;
  
  if(username)
  {
    console.log('settingup demo')

    const client = await init();
    await requestDemo(client.page, username);
    const user = await getUserStatus(client.page, username);
  
    await client.browser.close();

    res.status(200).send({ 
      s: 1,
      user: user 
    });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
});

app.listen(port, () => {
  log(`ready on port ${port}`);
});