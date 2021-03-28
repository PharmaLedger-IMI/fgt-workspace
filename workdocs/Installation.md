### Installation

In order to use the workspace, we need to follow a list of steps presented below.

[![Node version](https://img.shields.io/node/v/[fgt-workspace].svg?style=flat)](http://nodejs.org/download/)

#### Step 1: Clone the workspace

```sh
$ git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git
```

After the repository was cloned, you must install all the dependencies.

For the latest versions do:
```sh
$ cd fgt-workspace
#Important: If you plan to contribute to the project and/or dependecies please set DEV:true
#in the file env.json before you run the installation!
$ npm run dev-install
```

For latest 'stable' version do:
```sh
$ npm run install
```
instead.

**Note:** this command might take quite some time depending on your internet connection and you machine processing power.

#### Step 2: Launch the "server"

While in the *fgt-workspace* folder run:

```sh
$ npm run server
```

At the end of this command you get something similar to:

![alt text](resources/scr-npm-run-server.png)

#### Step 3: Build all DSUs and anchor them to the 'blockchain'.

Open a new console inside *fgt-workspace* folder and run:

```sh
# Note: Run this in a new console inside "fgt-workspace" folder
$ npm run build-all
```

### Documentation

To be able to generate the documentation for this project via

```sh
$ npm run docs
```

[draw.io](https://github.com/jgraph/drawio-desktop/releases) must be installed. Can be also obtained via

```sh
$ snap install drawio
```

in linux

after instalation if not present, add drawio to path

```shell
$ which drawio
```

add a file under ```docs/bin``` called ```drawio_exec_command.os``` containing the command/path to execute drawio

 - Linux:
    ```echo "drawio"```
 - Windows:
    ```echo "${PATH_TO_DRAW_IO}\drawio.exe"```
