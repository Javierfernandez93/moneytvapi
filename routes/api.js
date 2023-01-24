import express from 'express'

const router = express.Router();

router.get('/status/get', (req, res) => {
    const { id } = req.query
    
    let mClient = getClient(id)  

    if(mClient != undefined) 
    {
        res.status(200).send({
            status: mClient.status
        })
    }
})

export router