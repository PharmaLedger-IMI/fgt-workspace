# PDM Trust-Loader
Web Loader for the  Wallet User Interface

## How does it work?

Upon loading you are presented with a login/registration screen.

Upon registering, the Loader will create a new Wallet instance, anchor it to the blockchain,
and install the predefined SSApp(s) onto it.

When you login, the loader will retrieve the Wallet you had previously created, load the DSU, 
instantiate a new iframe use it as a container to the newly loaded SSApp\

### How to adapt the form?

#include ./workdocs/dynamicforms.md