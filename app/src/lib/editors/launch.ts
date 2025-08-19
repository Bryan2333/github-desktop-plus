import { ChildProcess, spawn, SpawnOptions } from 'child_process'
import { pathExists } from '../helpers/linux'
import { ExternalEditorError, FoundEditor } from './shared'
import {
  expandTargetPathArgument,
  ICustomIntegration,
  parseCustomIntegrationArguments,
} from '../custom-integration'

async function launchEditor(
  editorPath: string,
  args: readonly string[],
  editorName: string,
  spawnAsDarwinApp: boolean
) {
  const exists = await pathExists(editorPath)
  const label = __DARWIN__ ? 'Settings' : 'Options'
  if (!exists) {
    throw new ExternalEditorError(
      `Could not find executable for ${editorName} at path '${editorPath}'. Please open ${label} and select an available editor.`,
      { openPreferences: true }
    )
  }

  return new Promise<void>((resolve, reject) => {
    const opts: SpawnOptions = {
      // Make sure the editor processes are detached from the Desktop app.
      // Otherwise, some editors (like Notepad++) will be killed when the
      // Desktop app is closed.
      detached: true,
      stdio: 'ignore',
    }

    let child: ChildProcess
    if (__FLATPAK__) {
      child = spawn('flatpak-spawn', ['--host', editorPath, ...args], opts)
    } else if (spawnAsDarwinApp) {
      child = spawn('open', ['-a', editorPath, ...args], opts)
    } else {
      child = spawn(editorPath, args, opts)
    }

    child.on('error', reject)
    child.on('spawn', resolve)
    child.unref() // Don't wait for editor to exit
  }).catch((e: unknown) => {
    log.error(
      `Error while launching ${editorName}`,
      e instanceof Error ? e : undefined
    )
    throw new ExternalEditorError(
      e && typeof e === 'object' && 'code' in e && e.code === 'EACCES'
        ? `GitHub Desktop doesn't have the proper permissions to start ${editorName}. Please open ${label} and try another editor.`
        : `Something went wrong while trying to start ${editorName}. Please open ${label} and try another editor.`,
      { openPreferences: true }
    )
  })
}

async function launchExecutableAndReturnStdout(
  path: string,
  args: readonly string[]
) {
  const opts: SpawnOptions = {
    stdio: ['ignore', 'pipe', 'inherit'],
  }

  return new Promise<string>((resolve, reject) => {
    const child = spawn(path, args, opts)

    let stdout = ''
    child.stdout?.on('data', data => {
      stdout += data.toString()
    })

    child.on('error', reject)
    child.on('close', () => resolve(stdout))
  }).catch((e: unknown) => {
    log.error(
      `Error while launching ${path}`,
      e instanceof Error ? e : undefined
    )
    throw new ExternalEditorError(
      `Something went wrong while trying to start ${path}. Please open Options and try another editor.`,
      { openPreferences: true }
    )
  })
}

/**
 * Open a given file or folder in the desired external editor.
 *
 * @param fullPath A folder or file path to pass as an argument when launching the editor.
 * @param editor The external editor to launch.
 */
export const launchExternalEditor = (fullPath: string, editor: FoundEditor) =>
  launchEditor(editor.path, [fullPath], `'${editor.editor}'`, __DARWIN__)

/**
 * Open a given file or folder in the desired custom external editor.
 *
 * @param fullPath A folder or file path to pass as an argument when launching the editor.
 * @param customEditor The external editor to launch.
 */
export const launchCustomExternalEditor = (
  fullPath: string,
  customEditor: ICustomIntegration
) => {
  const argv = parseCustomIntegrationArguments(customEditor.arguments)

  // Replace instances of RepoPathArgument with fullPath in customEditor.arguments
  const args = expandTargetPathArgument(argv, fullPath)

  // In macOS we can use `open` if it's an app (i.e. if we have a bundleID),
  // which will open the right executable file for us, we only need the path
  // to the editor .app folder.
  const spawnAsDarwinApp = __DARWIN__ && customEditor.bundleID !== undefined
  const editorName = `custom editor at path '${customEditor.path}'`

  return launchEditor(customEditor.path, args, editorName, spawnAsDarwinApp)
}

export async function launchAndReturnStdout(
  fullPath: string,
  executable: ICustomIntegration
): Promise<string> {
  const argv = parseCustomIntegrationArguments(executable.arguments)
  const args = expandTargetPathArgument(argv, fullPath)

  return launchExecutableAndReturnStdout(executable.path, args)
}
