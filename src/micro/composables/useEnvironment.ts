import ENV from '../../../environment.json'

export default function () {
  const appEnviroment = String(process.env.VUE_APP_ENVIROMENT || 'local').toLowerCase()

  const getEnv = value => ENV[appEnviroment][value]

  return {
    appEnviroment,
    getEnv,
  }
}
