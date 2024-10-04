export const tutorials = [
  {
    id: 1,
    title: 'Introduction to Bash',
    description:
      'Bash is a command processor that typically runs in a text window where the user types commands. These commands cause actions to be performed.',
    challenge: 'Write a command that prints "Hello, World!" to the console.',
    example: 'echo "Hello, World!"',
    expectedOutput: 'Hello, World!\n',
  },
  {
    id: 2,
    title: 'Listing Files',
    description:
      'The `ls` command is used to list the files and directories in the current directory.',
    challenge: 'List all the files and directories in the current folder.',
    example: 'ls',
    expectedOutput: '', // Expected output will depend on the system, this can be omitted or customized.
  },
  {
    id: 3,
    title: 'Change Directory',
    description:
      'The `cd` command allows you to change the current working directory.',
    challenge: 'Change to the `/home` directory.',
    example: 'cd /home',
    expectedOutput: '', // For commands like `cd`, there might not be visible output.
  },
];
