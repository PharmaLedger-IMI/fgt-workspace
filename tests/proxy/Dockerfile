# The Base Image used to create this Image
FROM httpd:2.4.54

# to Copy a file named httpd_proxypass.conf from present working directory to the /usr/local/apache2/conf inside the container
# This is taken from the original httpd.conf inside the base image, and modified to allow ProxyPass
COPY httpd_proxypass.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 8808

CMD ["httpd-foreground"]