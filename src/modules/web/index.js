import express from 'express';
import dotenv from 'dotenv'
import moment from 'moment'
import {log, format, ocr, scrape, download} from '../'
const app = express()

dotenv.config()

app.set('view engine', 'ejs')

export default async => {
  app.get('/', async (req, res) => { 
    try {
      const base = req.query.week || moment().format('W')
      const basey = req.query.year || moment().format('YYYY')
      const date = moment().week(base).year(basey)
      const zoom = Number(req.query.zoom ? req.query.zoom : req.query.tv ? 2 : 1)

      if (req.query.fresh === "true")
      {
        const url = await scrape()
        await download(url, date)
      }

      const data = await ocr(date)
      const dat = await format(data)
      res.render(`${process.env.WEBSITE_TEMPLATE}/menu.ejs`, {...dat, zoom: zoom}))

    } catch(error) {
      log('ERROR', error, '#ff0000')
      res.render(`${process.env.WEBSITE_TEMPLATE}/error.ejs`)
    }
  })

  app.listen(process.env.SERVER_PORT, () => {
    log('LOG', 'Serving WebServer.')
  })
}