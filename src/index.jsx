/** @jsx createElement */
import _ from 'lodash'
import { createElement } from 'elliptical'
import { Command, String } from 'lacona-phrases'
import { exec } from 'child_process'
import { showNotification, setClipboard } from 'lacona-api'

function execPromise (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      return err ? reject(err) : resolve({stdout, stderr})
    })
  })
}

async function showOrCopy (subtitle, message) {
  const content = _.trim(message)
  if (content) {
    if (content.indexOf('\n') !== -1 || content.length > 50) {
      await setClipboard({text: content})
      await showNotification({title: 'Shell', subtitle, content: 'Output copied to Clipboard'})
    } else {
      await setClipboard({text: content})
      await showNotification({title: 'Shell', subtitle, content})
    }
  } else {
    await showNotification({title: 'Shell', subtitle})
  }
}

export const ExecuteCommand = {
  extends: [Command],

  async execute (result) {
    let stdout, stderr
    try {
      ({stdout, stderr} = await execPromise(result.command))
    } catch (e) {
      console.error(e)
      console.error('stdout:', stdout)
      console.error('stderr:', stderr)

      await showOrCopy('Error Executing Shell Command', stderr)
      return
    }

    await showOrCopy('Shell Command Executed Successfully', stdout)
  },

  describe () {
    return (
      <sequence>
        <list items={['execute ', 'run ', 'call ']} />
        <String label='Shell Command' consumeAll id='command' />
      </sequence>
    )
  }
}

export const extensions = [ExecuteCommand]
