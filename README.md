# epi-workspace

*epi-workspace*  bundles all the necessary dependencies for building and running EPI SSApps in a single package.

For more details about what a *workspace* is check out the [template-workspace](https://github.com/PrivateSky/template-workspace).

## Installation

In order to use the workspace, we need to follow a list of steps presented below. 

If you have trouble installing the *epi-workspace*, please try to follow the guide provided on [PrivateSky.xyz](https://privatesky.xyz/?Start/installation)

### Step 1: Clone the workspace

```sh
$ git clone https://github.com/PharmaLedger-IMI/epi-workspace.git
```

After the repository was cloned, you must install all the dependencies.

```sh
$ cd epi-workspace
#Important: If you plan to contribute to the project and/or dependecies please set DEV:true
#in the file env.json before you run the installation!
$ npm install
```
**Note:** this command might take quite some time depending on your internet connection and you machine processing power.

### Step 2: Launch the "server"

While in the *epi-workspace* folder run:

```sh
$ npm run server
```

At the end of this command you get something similar to:

![alt text](scr-npm-run-server.png)


### Step 3: Build all things needed for the application to run.

Open a new console inside *epi-workspace* folder and run:

```sh
# Note: Run this in a new console inside "epi-workspace" folder
$ npm run build-all
```



## Running 
To run the application launch your browser (preferably Chrome) in Incognito mode and access the http://localhost:8080 link.

### Enterprise wallet

Enterprise wallet allows creation of Products and Batches.

#### Step 1: Register details

```
Username: test1234

Email: test@test.test

Password: test1234567890
```

#### Step 2: Setup credential for Issuer
    1. Go to Issuer page
    2. Put "epi" in application domain field and press "Generate Identity"
    3. Copy the the generated issuer identity
    4. Paste and save it into /apihub-root/external-volume/issuers-public-identities file. The entry should be on a single line.

#### Step 3: Setup credentials for Holder
    1. Go to Holder
    2. Put "epi" in application domain field and press "Generate Identity"
    3. Copy the generated User Identity 
    4. Paste it into Issuer's field named "Identity of a new user in domain [epi]" and press "Generate Credentials"
    5. Copy the generated credentials (from Issuer's page) and paste it into credential field inside the Holder page and press "Save Credentials"

Now you will act as a Holder thus will be able to add Products (and leaflets for it) and create Batches of products.



### EPI Client
This is the part a normal user will see. The part that will
be used to scan barcodes on drug's packages.

## Prepare & release a new stable version of the workspace
Steps:
1. start from a fresh install of the workspace.
```
git clone https://github.com/PharmaLedger-IMI/epi-workspace
cd epi-workspace
```
2. ensure that env variable called DEV is set to true in env.json file
>{
>  "PSK_TMP_WORKING_DIR": "tmp",
>  "PSK_CONFIG_LOCATION": "../apihub-root/external-volume/config",
>  **"DEV": true**
>}
3. run the installation process of the workspace
```
npm install
```
4. run the server and build the ssapps and wallets
```
npm run server
npm run build-all
```
4. verify that the builds are successfully and the ssapps are functioning properly
5. execute the freeze command
```
npm run freeze
```
6. verify the output of freeze command and check for errors. If any, correct them and run again the freeze command.
7. commit the new version of the octopus.json file obtained with the freeze command.


### Build Android APK

Steps

1. Install all dependencies (as develoment) for this workspace
```sh
npm run dev-install
```

2. Bind Android repository into workspace
```sh
npm run install-mobile
```

3. Launch API HUB
```sh
npm run server
```

4. Prepare the Node files that will be packed into the Android app
```sh
#In another tab / console
npm build-mobile
```

5. Have /mobile/scan-app/android/local.properties file with the following content

```sh
# Change the value to your SDK path
sdk.dir=/home/alex/Android/Sdk
```
More on this [here](https://github.com/PrivateSky/android-edge-agent#iv-setup-local-environment-values)

6. Build the APK
```sh
npm build-android-apk
```

This concludes the steps to build the APK file.

**Note:** The .apk file should be in folder
```
mobile/scan-app/android/app/build/outputs/apk/release
```