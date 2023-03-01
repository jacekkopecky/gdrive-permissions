import commandLineArgs from 'command-line-args';
import filesCommand from './cmd-files.js';

const topLevelOptions: commandLineArgs.OptionDefinition[] = [
  { name: 'command', defaultOption: true },
  { name: 'help', alias: 'h', type: Boolean },
];

interface Command {
  command: string;
  arguments?: commandLineArgs.OptionDefinition[];
  function?: (args: Record<string, unknown>) => void | Promise<void>;
  description?: string | string[];
}

/*

--list-emails (-e)
--list-files-with-permission (-l) (email | "anyone") [role]

- [ ] for a given [email] and [role], list files where that email has that role
  - every matching line should have file ID and permission ID, somehow specially formatted
  - folders may or may not have the role, how do we show that?
  - maybe by listing the folders without the ID
- [ ] for a given role and email "anyone", list files where "anyone" has that role
- [ ] for a given email, list files where that user has any role, with the role
- [ ] given a trimmed file (with removed lines) listed like above, remove email and or role

*/

const commands: Command[] = [
  {
    command: 'emails',
    description: 'List emails that have permissions, and the roles they have.',
  },
  {
    command: 'files',
    function: filesCommand,
    description: 'List the files found in the drive.',
  },
  {
    command: 'find',
    arguments: [{ name: 'params', defaultOption: true, multiple: true }],
    description: [
      'Find files where the given email (or "anyone") has a permission.',
      'If a role is also specified ("writer", "commenter", "reader", "owner"),',
      'only show files where that user has that role.',
      'The output of this command can be edited by removing lines,',
      'then it can be given to the "remove" command.',
    ],
  },
  {
    command: 'remove-from-file',
    description: [
      'Given as input the output of the "find" command,',
      'remove all the listed permissions.',
    ],
  },
];

function help(short = false) {
  if (short) {
    console.log('gdrivep: specify a command, or use -h for help');
    return;
  }

  console.log(`GDriveP: tool for reviewing and removing permissions in shared Google Drives.

Usage: gdrivep <command> [options]

Global options:
  --help, -h      Show this help message.

Commands:`);

  for (const cmd of commands) {
    let line = '  ' + cmd.command;
    if (cmd.arguments) line += ' <params>';
    if (!cmd.function) line += ' (not implemented)';
    console.log(line);
    const descriptions = Array.isArray(cmd.description) ? cmd.description : [cmd.description];
    for (const desc of descriptions) {
      if (desc != null) {
        console.log('    ' + desc);
      }
    }
    console.log();
  }
}

export async function parseArgsAndRun(): Promise<void> {
  const mainOptions = commandLineArgs(topLevelOptions, { stopAtFirstUnknown: true });
  const argv = mainOptions._unknown || [];

  if (mainOptions.help) {
    help();
    return;
  }
  if (!mainOptions.command) {
    help(true);
    return;
  }

  const command = findCommand(mainOptions.command);
  if (!command) {
    console.warn('Unknown command:', mainOptions.command);
    help(true);
    return;
  }

  const args = command.arguments ? commandLineArgs(command.arguments, { argv }) : {};
  if (command.function) {
    return command.function(args);
  } else {
    console.warn('Command not implemented:', mainOptions.command);
  }
}

function findCommand(name: unknown): Command | undefined {
  return commands.find((cmd) => cmd.command === name);
}
