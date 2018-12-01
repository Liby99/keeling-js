# TODO List for Keeling-js V2

1. [ ] Initiation Friendly: We only want three lines to start the server. 1. import the library. 2.
   create a server with appropriate config. 3. start the server
   1. [ ] In the first step, we want to have the default module exported from keeling-js is the
      server
   2. [ ] In the second step, we want to have several options for importing the config
      1. [ ] no argument. That will allow keeling-js to get config file from some default
         directories, or use default config. Won't be any error here except the config file that is
         getting read has errors.
      2. [ ] a string arg. That will allow keeling-js to load the config file there. Throw error
         when not found.
      3. [ ] an object. That object will be directly loaded with default config filled in the
         blanks.
   3. [ ] Between second and third step, we want the user to be able to deal with the server a
      little bit.
2. [ ] Option to not use any start up script (index.js or so). You can do this by running command
   line argument and passing in config file path. It will directly start the program. But using this
   option means the fastest setup with no control over the server details (you cannot customize the
   middlewares.)
3. [ ] Better installation script. Create `init.js` and `bin` so that the script could be run in
   command line. Use prompts to lead the user come up with the default options. Will put the
   directories in the directory where user invokes the script.
