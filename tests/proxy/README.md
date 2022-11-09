# FGT participant going through 2 proxies

A short example of configuring an FGT participant using a chain of 2 proxies.
- a static proxy (running at http://localhos:8808 on this example) called httpd-proxy-static that always forwards all requests to https://fgt-dev.pharmaledger.pdmfc.com through a generic proxy (also configured statically - see below).
- a generic proxy (a squid proxy running on http://pdm-00781:3128 for this example)

Port numbers provided are just for example completness. Should be changed to whatever you need.

## DISCLAIMER

This configuration is not security-validated. A lot of apache's default configuration should be removed/inhibited for production purposes.

But this example should be enough to see the Proxy configuration directives required.

(This example was not validated on an environment where the apache was prevented to connect to the internet - as in this example would loose also access to the squid proxy also.)


## Configure an apache httpd 2.4.54 as a static proxy inside a docker

### Edit the static proxy config

Edit the tests/proxy/httpd_proxypass.conf to suite your configs.
The most relevant are at the bottom

```xml
# Global config

SSLProxyEngine on
# all external accesses should go through this proxy (this is my local squid)
# PLACE YOUR OPENSHIFT PROXY HERE - the one that is defined by the https_proxy variable
ProxyRemote * http://pdm-00781:3128

NameVirtualHost *
<VirtualHost *>
    ServerName owncloud.mydomain.com

    ProxyRequests Off
    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>

    # pass everything to https://fgt-dev.pharmaledger.pdmfc.com
    # use https://fgt.pharmaledger.pdmfc.com when confident

    ProxyPass / https://fgt-dev.pharmaledger.pdmfc.com/
    ProxyPassReverse / https://fgt-dev.pharmaledger.pdmfc.com/
    <Location />
        Order allow,deny
        Allow from all
    </Location>
</VirtualHost>
```

Compare (diff) with httpd_original.conf
(note that it is listening on 8088, and needs to load proxy_module proxy_http_module ssl_module)

### Build the static proxy

```sh
docker build -t httpd-proxy-static .
```

### Run the static proxy as a standalone docker at port 8808

```sh
docker run --network="host" -p 8808:8808 httpd-proxy-static
```

The `--network="host"` was needed just to connect to the squid proxy at http://pdm-00781:3128
but, your docker container should have connection to your generic proxy without further configs.

### Edit the apihub-root/external-volume/config/bdns.hosts so that the domain traceability goes through the proxy

The domain traceability should go through the static proxy.
Note that it is an http (not https) proxy.

In this example, as the static proxy is running at http://localhost:8808, that is the address we use.
( Do not confuse with the squid running at http://pdm-00781:3128 ).

```json
    "traceability": {
      "replicas": [],
      "brickStorages": [
        "http://localhost:8808"
      ],
      "mqEndpoints": [
        "http://localhost:8808"
      ],
      "anchoringServices": [
        "http://localhost:8808"
      ]
    },
```


## Notes on how to install and run a squid proxy on Ubuntu 22

```sh
sudo apt install squid
```

Squid will be left running on port 3128.

To test, configure a browser using a proxy at localhost:3128 (or pdm-00781:3121),
test access to a web page, and check /var/log/squid/access.log that all
this browser's accesses go through this proxy.

systemctl enable squid
systemctl start squid

systemctl status squid

systemctl stop squid
systemctl disable squid
