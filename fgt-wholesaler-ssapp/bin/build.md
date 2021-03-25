#### SSApp Building

##### Building
###### build.file

Builds the SSApp template. The build file consists of several commands, typically:

```shell
delete /
addfile bin/init.file init.file
addfolder code
mount ../webcardinal/seed /webcardinal
mount ../themes/*/seed /themes/*
```
where:
 - deletes the DSUs entire filesystem (if it already exists)
 - adds the init.file for SSApp initialization purposes (optional)
 - adds the code folder
 - mounts the Frontend framework
 - mounts all available themes

##### Initializing
###### init.file

Initializes the SSApp Instance. The init file typically consists of

```shell
createfile identity.json -$Identity-
createfile environment.json -$Environment-
```
where:
- (Optional) creates an identity.json file in the DSU (-$Identity- is a placeholder and will be replaced by the secrets object from the loader)
- creates an environment.json file in the DSU (-$Environemnt- is a placeholder and will be replaced by the environment object from the loader)
