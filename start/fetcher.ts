import {spawn} from "child_process";
import {getMenu} from "App/Common/HelperFunctions";
import moment from "moment";
import Logger from "@ioc:Adonis/Core/Logger";
import {hasWeekImage} from "App/Common/MenuHelpers";

const ls = spawn('node', ['../start/subprocesses/fetcher.js'])

ls.stdout.on('data', async (stdout) => {
  let type = stdout.toString().replace(/(\r\n|\n|\r)/gm, "");
  if (type === "menu") {
    const data = await getMenu(moment(), true, false)
    if (!hasWeekImage(moment(data["listed_week"], "WW"))) {
      Logger.info("New menu found, writing to disk.")
      await getMenu(moment(), true, true);
    } else {
      const menu = await getMenu(moment(), false, true)
      if (JSON.stringify(menu) !== JSON.stringify(data)) {
        Logger.warn("Newer menu was found. Replacing old menu.")
        await getMenu(moment(), true, true)
      }
    }
    return;
  }
  Logger.info(`fetcher scheduler: ${stdout}`);
});

ls.stderr.on('data', (data) => {
  Logger.error(`fetcher scheduler: ${data}`)
});

ls.on('close', (code) => {
  Logger.warn(`fetcher scheduler process exited with code ${code}.`)
});
