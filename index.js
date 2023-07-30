import express from "express";
import { init, requestDemo, requestService, getUserById, requestRenovation, getUserByName, getLastMovies, requestFull, existUserById, log } from "./controller/controller.js";
import cors from 'cors'
import config from './config/config.json' assert {type: 'json'};

const app = express();

process.setMaxListeners(0)

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

app.get("/user/get/username", async (req, res) => {
  const { username } = req.query;

  if(username)
  {
    log('gettinguserbyusername', username);
    
    const client = await init()
  
    const user = await getUserByName(client.page, username);
    
    await client.browser.close();
    
    log('done')

    res.status(200).send({ user: user, s: 1 });
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.NOT_ID
    });
  }
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
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.NOT_ID
    });
  }
});

app.get("/user/renovation", async (req, res) => {
  const { id, package_id } = req.query;
  
  if(id)
  {
    log(`settingup renovation ${id} ${package_id}`)

    const client = await init();
    
    const response = await requestRenovation(client.page, id, package_id);

    if(response.s == 1)
    {
      const user = await getUserById(client.page, id);
    
      await client.browser.close();
  
      res.status(200).send({ 
        s: 1,
        user: user
      });
    } else {
      res.status(200).send(response);
    }
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.NOT_ID
    });
  }
})

app.get("/user/service", async (req, res) => {
  const { username, password, package_id } = req.query;
  
  if(username)
  {
    if(password)
    {
      log('settingup service')

      const client = await init();

      await requestService(client.page, {
        username : username,
        password : password,
        package_id : package_id
      });

      const user = await getUserByName(client.page, username);
    
      await client.browser.close();

      res.status(200).send({ 
        s: 1,
        user: user
      });
    } else {
      res.status(200).send({ 
        s: 0, 
        r: config.STATUS.PASSWORD_NOT_FOUND
      });
    }
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.USERNAME_NOT_FOUND
    });
  }
})

app.get("/user/demo", async (req, res) => {
  const { username, password } = req.query;
  
  if(username)
  {
    if(password)
    {
      log('settingup demo')
  
      const client = await init();
  
      if(client.s == 1)
      {
        await requestDemo(client.page, {
          username: username, 
          password: password
        });
  
        const user = await getUserByName(client.page, username);
    
        await client.browser.close()
    
        res.status(200).send({ 
          s: 1,
          user: user
        });
      } else {
        res.status(200).send(client)
      }
    } else {
      res.status(200).send({ 
        s: 0, 
        r: config.STATUS.PASSWORD_NOT_FOUND
      });
    }
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.USERNAME_NOT_FOUND
    });
  }
});

app.get("/user/exist", async (req, res) => {
  const { id } = req.query;
  
  if(id)
  {
    log('looking for user')

    const client = await init();

    const response = await existUserById(client.page, id);

    if(response.s == 1)
    {
      await client.browser.close()

      res.status(200).send({ 
        s: 1,
        found: true
      });
    } else {
      res.status(200).send({ 
        s: 1,
        found: config.STATUS.USERNAME_NOT_FOUND
      });
    }
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.NOT_ID
    });
  }
});

app.get("/user/full", async (req, res) => {
  const { id, package_id } = req.query;
  
  if(id)
  {
    log('settingup full')

    const client = await init();
    
    const response = await requestFull(client.page, id, package_id);

    if(response.s == 1)
    {
      const user = await getUserById(client.page, id);
  
      await client.browser.close()
  
      res.status(200).send({ 
        s: 1,
        user: user
      });
    } else {
      res.status(200).send(response);
    }
  } else {
    res.status(200).send({ 
      s: 0, 
      r: config.STATUS.NOT_ID
    });
  }
});

app.listen(port, () => {
  log(`ready on port ${port}`);
});