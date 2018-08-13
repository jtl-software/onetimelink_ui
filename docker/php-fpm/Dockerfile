# FROM phpdockerio/php7-fpm:latest
FROM phpdockerio/php71-fpm:latest

WORKDIR "/application"

# Install selected extensions and other stuff
RUN apt-get update \
    && apt-get -y --no-install-recommends install ca-certificates curl git php-xml php-mbstring php-mongodb \
    && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*