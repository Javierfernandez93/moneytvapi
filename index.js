import express from "express";
import { init, requestDemo, requestService, getUserById, requestRenovation, getUserByName, getLastMovies, requestFull, log } from "./controller/controller.js";
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

app.get("/movies/last", async (req, res) => {
  const client = await init()
  const movies = await getLastMovies(client.page);
    
  await client.browser.close();
  
  log('done')

  res.status(200).send({ movies: movies, s: 1 });
})

app.get("/user/get", async (req, res) => {
  const { id } = req.query;

  if(id)
  {
    log('gettinguser')
    
    const client = await init()
    const user = await getUserById(client.page, id);
    
    await client.browser.close();
    
    log('done')

    res.status(200).send({ user: user, s: 1 });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
});

app.get("/user/renovation", async (req, res) => {
  const { id, package_id } = req.query;
  
  if(id)
  {
    log(`settingup renovation ${id} ${package_id}`)

    const client = await init();
    await requestRenovation(client.page, id, package_id);
    const user = await getUserById(client.page, id);
  
    await client.browser.close();

    res.status(200).send({ 
      s: 1,
      user: user
    });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
})

app.get("/user/service", async (req, res) => {
  const { username, package_id } = req.query;
  
  if(username)
  {
    log('settingup service')

    const client = await init();
    await requestService(client.page, username, package_id);
    const user = await getUserByName(client.page, username);
  
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
    log('settingup demo')

    const client = await init();
    await requestDemo(client.page, username);
    const user = await getUserByName(client.page, username);

    await client.browser.close()

    res.status(200).send({ 
      s: 1,
      user: user 
    });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
});

app.get("/user/full", async (req, res) => {
  const { id, package_id } = req.query;
  
  if(id)
  {
    log('settingup full')

    const client = await init();
    await requestFull(client.page, id, package_id);
    const user = await getUserById(client.page, id);

    await client.browser.close()

    res.status(200).send({ 
      s: 1,
      user: 1 
    });
  } else {
    res.status(200).send({ s: 0, r: 'NOT_USERNAME' });
  }
});

app.listen(port, () => {
  log(`ready on port ${port}`);
});