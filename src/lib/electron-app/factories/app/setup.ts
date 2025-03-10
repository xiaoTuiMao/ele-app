import { app, BrowserWindow } from 'electron'

import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from 'electron-extension-installer'

import { ignoreConsoleWarnings } from '../../utils/ignore-console-warnings'
import { PLATFORM, ENVIRONMENT } from 'shared/constants'
import { makeAppId } from 'shared/utils'

ignoreConsoleWarnings(['Manifest version 2 is deprecated'])

export async function makeAppSetup(createWindow: () => Promise<BrowserWindow>) {
  if (ENVIRONMENT.IS_DEV) {
    await installExtension([REACT_DEVELOPER_TOOLS], {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    })
  }

  let window = await createWindow()

  app.on('activate', async () => {
    const windows = BrowserWindow.getAllWindows()

    if (!windows.length) {
      window = await createWindow()
    } else {
      for (window of windows.reverse()) {
        window.restore()
      }
    }
  })

  app.on('web-contents-created', (_, contents) =>
    contents.on(
      'will-navigate',
      (event, _) => !ENVIRONMENT.IS_DEV && event.preventDefault()
    )
  )

  app.on('window-all-closed', () => !PLATFORM.IS_MAC && app.quit())

  return window
}

PLATFORM.IS_LINUX && app.disableHardwareAcceleration()

PLATFORM.IS_WINDOWS &&
  app.setAppUserModelId(ENVIRONMENT.IS_DEV ? process.execPath : makeAppId())

app.commandLine.appendSwitch('force-color-profile', 'srgb')
